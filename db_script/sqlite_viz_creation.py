# python script to build sqlite for visualization
# coding=utf8
import subprocess
import sqlite3
import os
import json
import itertools
import utils
import FedericoTena

try :
	conf=json.load(open("config.json","r"))
	database_filename=os.path.join('../sqlite_data',conf["sqlite_viz"])
except :
	print "couldn't load config.json database"
	exit(1)

try:
	if os.path.isfile(database_filename):
		os.remove(database_filename)
except:
	print "couldn't delete target sqlite database file"
	exit(1)

print "building sqlite database from CSV" 
utils.csv2sqlite("../csv_data/*.csv",database_filename,conf["sqlite_schema"])


conn=sqlite3.connect(database_filename)
c=conn.cursor()

print "importing Frederico Tena from csv"
FedericoTena.import_fredericotena(c)

################################################################################
##			Update every table with uniformed attributes
################################################################################
c.execute("""UPDATE flows SET source= UPPER(SUBSTR(source, 1, 1)) || SUBSTR(source, 2) """)
c.execute("""UPDATE sources SET slug = UPPER(SUBSTR(slug, 1, 1)) || SUBSTR(slug, 2) """)
c.execute("""UPDATE exchange_rates SET source= UPPER(SUBSTR(source, 1, 1)) || SUBSTR(source, 2) """)

################################################################################
##			Remove dup in entities_name table
################################################################################
c.execute("""delete from entity_names
	   		 where original_name in ("Dutch new Guinea","Ionian islands","United states");
			""")
################################################################################
##			Create table flow_joined
################################################################################

print "Create table flow_joined"
print "-------------------------------------------------------------------------"

c.execute("""DROP TABLE IF EXISTS flow_joined;""")
c.execute("""CREATE TABLE IF NOT EXISTS flow_joined AS
	 SELECT f.id, f.source, st.type, f.flow, f.year,
	 	f.unit as unit,
		eisg.modified_export_import as expimp,
		eisg.modified_special_general as spegen,
		rate.rate_to_pounds as rate,
		c.modified_currency as currency,
		r1.RICname as reporting,
		r2.slug as reporting_slug,
		CASE
			WHEN p2.RICname="World" and world_trade_type="total_estimated" THEN "Worldestimated"
			WHEN p2.RICname="World" and world_trade_type="total_reporting1" THEN "Worldasreported"
			WHEN p2.RICname="World" and world_trade_type="total_reporting2" THEN "Worldasreported2"
			WHEN p2.RICname="World" and world_trade_type is null THEN "Worldundefined"
			ELSE p2.slug
		END as partner_slug,
		CASE
			WHEN p2.RICname="World" and world_trade_type="total_estimated" THEN "World estimated"
			WHEN p2.RICname="World" and world_trade_type="total_reporting1" THEN "World as reported"
			WHEN p2.RICname="World" and world_trade_type="total_reporting2" THEN "World as reported2"
			WHEN p2.RICname="World" and world_trade_type is null THEN "World undefined"
			ELSE p2.RICname
		END as partner,
		r2.type as reporting_type,
		r2.continent as reporting_continent,
		p2.type as partner_type,
		p2.continent as partner_continent,
		transport_type,
		f.notes,
		species_bullions
		from flows as f
		LEFT OUTER JOIN currencies as c
			ON f.currency=c.currency
			    AND f.year=c.year
			    AND f.reporting = c.reporting
		LEFT OUTER JOIN exchange_rates as rate
			ON c.modified_currency=rate.modified_currency
			    AND c.year=rate.year
		LEFT OUTER JOIN entity_names as r1
			 	ON r1.original_name=f.reporting COLLATE NOCASE
		LEFT OUTER JOIN entity_names as p1
			 	ON p1.original_name=f.partner COLLATE NOCASE
		LEFT OUTER JOIN RICentities as p2
			 	ON p2.RICname=p1.RICname COLLATE NOCASE
		LEFT OUTER JOIN RICentities as r2
			 	ON r2.RICname=r1.RICname COLLATE NOCASE
		LEFT OUTER JOIN expimp_spegen as eisg
			 	USING (export_import, special_general)
		LEFT OUTER JOIN sources as s
				ON s.slug=f.source
		LEFT OUTER JOIN source_types as st
				ON st.acronym=s.acronym
		WHERE expimp != "Re-exp"
			and partner is not null
			and partner_sum is null
			and s.acronym != "OUPS"
			and f.flow is not null
	""")

print "flow_joined created"
print "-------------------------------------------------------------------------"

# taking care of Total_type flag to define the world partner
# and ((`Total Trade Estimation` is null and partner != "World" )or(`Total Trade Estimation`=1 and partner = "World"))

c.execute("""INSERT INTO RICentities (`RICname`,`type`,`continent`, `slug`)
	VALUES ("World estimated","geographical_area","World", "Worldestimated")""")

print "World estimated added to RICentities"

c.execute("""INSERT INTO RICentities (`RICname`,`type`,`continent`, `slug`)
	VALUES ("World as reported","geographical_area","World", "Worldasreported")""")

print "World as reported added to RICentities"

c.execute("""INSERT INTO RICentities (`RICname`,`type`,`continent`, `slug`)
	VALUES ("World as reported2","geographical_area","World", "Worldasreported2")""")

print "World as reported2 added to RICentities"

c.execute("""INSERT INTO RICentities (`RICname`,`type`,`continent`, `slug`)
	VALUES ("World undefined","geographical_area","World", "Worldundefined")""")

print "World undefined added to RICentities"
print "-------------------------------------------------------------------------"

################################################################################
# merge duplicates from land and sea
################################################################################

c.execute("""SELECT count(*) as nb,group_concat(`flow`,'|'),group_concat(ID,'|'),
	group_concat(transport_type,'|')
	FROM `flow_joined`
	WHERE transport_type is not null
	GROUP BY year, expimp, reporting, partner HAVING count(*)>1
	""")
sub_c=conn.cursor()
rows_grouped=0
for n,flows,ids,land_seas in c :
	if n==2:
		land_sea=", ".join(set(land_seas.split("|")))
		if len(set(land_seas.split("|")))>1:
			# if notes :
			# 	notes=", ".join(set(notes.split("|")))
			sub_c.execute("""UPDATE `flow_joined` SET flow=%.1f,transport_type="%s"
				WHERE ID=%s"""%(sum(float(_) for _ in flows.split("|")),land_sea,ids.split("|")[0]))
			sub_c.execute("""DELETE FROM `flow_joined` WHERE ID=%s"""%ids.split("|")[1])
			rows_grouped+=2
if rows_grouped>0:
	print "removing %s land/seas duplicates by suming them"%rows_grouped
sub_c.close()
print "merge duplicates from land and sea done"
print "-------------------------------------------------------------------------"
################################################################################
# remove 'valeurs officielles' when duplicates with 'Valeurs actuelles'
# for France between 1847 and 1856 both included
################################################################################

c.execute("""SELECT count(*) as nb,group_concat(notes,'|'),group_concat(ID,'|'),
	group_concat(Source,'|') as notes_group
	FROM `flow_joined`
	WHERE `reporting`="France"
		and year >= 1847 AND year <= 1856
		GROUP BY year,expimp,reporting,partner HAVING count(*)>1
	""")

ids_to_remove=[]
for n,notes,ids,sources in c :
	if n==2:
		i=notes.split("|").index("Valeur officielle")
		id=ids.split("|")[i]
		#print sources.split("|")[i].encode("UTF8")
		if sources.split("|")[i] == u"""Tableau décennal du commerce de la France avec ses colonies et les puissances étrangères, 1847-1856, vol. 1.""":
			ids_to_remove.append(id)
		else:
			raise
	# else:
	# 	raise Exception("exception --->  ", n)
if len(ids_to_remove)>0:
	print "removing %s 'Valeur officielle' noted duplicates for France between 1847 1856"%len(ids_to_remove)
	c.execute("DELETE FROM flow_joined WHERE id IN (%s)"%",".join(ids_to_remove))

print "remove 'valeurs officielles' when duplicates with 'Valeurs actuelles' done"
print "-------------------------------------------------------------------------"
################################################################################
# remove "species and billions" remove species flows when exists
################################################################################

c.execute("""SELECT * from (SELECT count(*) as nb,
	group_concat(species_bullions,'|') as sb, group_concat(ID,'|'),
	reporting, partner
	FROM `flow_joined`
	GROUP BY year,expimp,reporting,partner HAVING count(*)>1)
	WHERE sb="S|NS"
	""")#
ids_to_remove=[]
rps=[]
for n,sb,ids,r,p in c :
	if n==2 :
		i=sb.split("|").index("S")
		id=ids.split("|")[i]
		ids_to_remove.append(id)
		rps.append('"%s"'%"|".join((r,p)))
rps=set(rps)

if len(ids_to_remove)>0:
	print """removing %s flows S duplicated with NS for reporting|partner 
	couples %s"""%(len(ids_to_remove),",".join(rps))
	c.execute("DELETE FROM flow_joined WHERE id IN (%s)"%",".join(ids_to_remove))

print "remove species and billions remove species flows when exists"
print "-------------------------------------------------------------------------"
################################################################################
# remove GEN flows when duplicates with SPE flows
################################################################################

c.execute("""SELECT count(*) as nb, group_concat(spegen,'|'),
	group_concat(species_bullions,'|') as sb, group_concat(ID,'|'),
	reporting, partner, year, expimp, group_concat(flow,'|')
	FROM `flow_joined`
	GROUP BY year,`expimp`,`reporting`,`partner` HAVING count(*)>1
	""")
lines=c.fetchall()
ids_to_remove={}
gen_remove=0
for n, spe_gens, sb, ids, reporting, partner, year, e_i, f in lines :
	local_ids_to_remove=[]
	dup_found=True
	if spe_gens and "Gen" in spe_gens.split("|") and "Spe" in spe_gens.split("|") :
		spe_indeces=[k for k,v in enumerate(spe_gens.split("|")) if v =="Spe"]
		if len(spe_indeces)>1 and sb != None:
			#if we have more than 1 Spe as dups
			speNS_indeces=[k for k,v in enumerate(sb.split("|")) if v =="NS" and k in spe_indeces]
			if len(speNS_indeces)>1:
			#if we have more than 1 NS in Spe dups
				dup_found=False
			elif len(ids.split("|"))==len(sb.split("|")) and len(speNS_indeces)>1:
				# keep only the Spe & NS flow when duplicate and if no nulls in sb 
				# otherwise we can't figure out which ID to remove
				local_ids_to_remove=[v for k, v in enumerate(ids.split("|")) if k!=speNS_indeces[0]]
			else:
				dup_found=False
		elif len(ids.split("|"))==len(spe_gens.split("|")):
			# remove the Gen flows which dups with one Spe flow and if no nulls in 
			# spe_gens other wise we can't figure out which ID to remove
			local_ids_to_remove=[v for k,v in enumerate(ids.split("|")) if k!=spe_indeces[0]]
		else:
			dup_found=False
		if len(local_ids_to_remove)>0:
			if reporting in ids_to_remove.keys():
				ids_to_remove[reporting]+=local_ids_to_remove
			else:
			 	ids_to_remove[reporting]=local_ids_to_remove
	else:
		dup_found=False

	if not dup_found:
		# flows are dups but not on GEN/SPE distinction or some null values in the groupings
		gen_remove +=1
		#print gen_remove, ("duplicate found :%s flows for %s,%s,%s,%s,%s,%s"%(n,year,reporting,
		#	partner,e_i,spe_gens,sb)).encode("utf8")
print "-------------------------------------------------------------------------"

if gen_remove>0:
	print "We found %s duplicate flows but not on GEN/SPE distinction..."%gen_remove

if ids_to_remove:
	for r, ids in ids_to_remove.iteritems():
		print ("removing %s Gen or Species duplicates for %s"%(r,len(ids))).encode("utf8")
		c.execute("DELETE FROM flow_joined WHERE id IN (%s)"%",".join(ids))

print "-------------------------------------------------------------------------"

################################################################################
##			Create the partner World as sum of partners
################################################################################
c.execute("""INSERT INTO RICentities (`RICname`, `type`, `continent`, `slug`)
	VALUES ("World sum partners", "geographical_area", "World", "Worldsumpartners")""")

print "World sum partners added to RICentities"

c.execute("""INSERT INTO flow_joined (flow, unit, reporting, reporting_slug, year, 
	expimp, currency, partner, partner_slug, rate, source, type, reporting_type, reporting_continent)
			SELECT sum(flow*unit) as flow,
				1 as unit,
				reporting,
				reporting_slug,
				year,
				expimp,
				currency,
				'World sum partners' as partner,
				'Worldsumpartners' as partner_slug,
				rate,
				source,
				type,
				reporting_type, 
				reporting_continent
				from flow_joined
			WHERE partner not like 'World%'
			group by reporting, expimp, year """)

print "World sum partners added to flow_joined"
print "-------------------------------------------------------------------------"

# ################################################################################
# ##			Create the partner World as best guess
# ################################################################################
c.execute("""INSERT INTO RICentities (`RICname`,`type`,`continent`, `slug`)
	VALUES ("World best guess", "geographical_area", "World", "Worldbestguess")""")

print "World as best guess added to RICentities"
print "-------------------------------------------------------------------------"

c.execute("""SELECT year, expimp, partner, reporting, partner_slug, reporting_slug, 
	flow, unit, currency, rate, source, type, reporting_type, reporting_continent
	from flow_joined
	WHERE partner LIKE "World%"  """)
data=list(c)
data.sort(key=lambda _:(_[3],_[0],_[1]))

world_best_guess_added = 0
for g,d in itertools.groupby(data,lambda _:(_[3],_[0],_[1])):
	dd=list(d)

	world_best_guess=[sd for sd in dd if sd[4]==u"Worldestimated"]
	if len(world_best_guess)==0:
		world_best_guess=[sd for sd in dd if sd[4]==u"Worldasreported"]
	if len(world_best_guess)==0:
		world_best_guess=[sd for sd in dd if sd[4]==u"Worldsumpartners"]
	if len(world_best_guess)==0:
		pass
	else:
		world_best_guess=list(world_best_guess[0])
		world_best_guess[2]=u"World_best_guess"
		world_best_guess[4]=u"Worldbestguess"
		c.execute("""INSERT INTO flow_joined (year, expimp, partner, reporting, 
			partner_slug, reporting_slug, flow, unit, currency, rate, source, type,
			reporting_type, reporting_continent)
		VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", world_best_guess)
		world_best_guess_added += 1

print "World best guess added to flow_joined", world_best_guess_added
print "-------------------------------------------------------------------------"

################################################################################
##			Create table metadata_old
################################################################################

# print "Create table metadata_old"
# print "-------------------------------------------------------------------------"

# c.execute("""DROP TABLE IF EXISTS metadata;""")
# c.execute("""CREATE TABLE IF NOT EXISTS metadata AS
# 	 		 SELECT tot.reporting_id as reporting_id, tot.reporting as reporting, group_concat(tot.flow,"|") as flow,  group_concat(tot.expimp,"|") as expimp,
# 			 group_concat(tot.partner,"|") as partner, tot.year as year,
#              group_concat(tot.type,"|") as sourcetype,  group_concat(tot.source,"|")  as source,count(distinct tot.source) as source_count,
#              tot.reporting_continent as reporting_continent, tot.reporting_type as reporting_type,"actual" as partnertype,group_concat(mirror_partner,"|") as mirror_partner
#              from
#              (SELECT reporting_id, reporting, flow, r.expimp as expimp,
#              partner as partner, r.year as year, type, source, reporting_continent, reporting_type,(t1.reportings ||"+"|| t1.expimp) as mirror_partner
#              FROM
#              (select t.reporting_slug as reporting_id,t.reporting as reporting, sum(t.flow) as flow, t.expimp as expimp, group_concat(t.partner_slug) as partner,
#              t.year as year, t.reporting_continent as reporting_continent, t.reporting_type as reporting_type,group_concat(distinct t.type) as type,group_concat(distinct t.source)  as source
#              FROM
#              (SELECT reporting, reporting_slug, flow*Unit/ifnull(rate,1) as flow, (replace(partner_slug,",","")||"+"||partner_continent) as partner_slug, year, source, type,reporting_continent,reporting_type, expimp
#              FROM flow_joined
#              WHERE partner_slug NOT LIKE 'World%' 
#              AND flow*Unit/rate is not NULL
#              AND partner_continent is not NULL
#              GROUP BY  reporting_slug, partner_slug,year,expimp) t
#              Group by t.reporting_slug, t.year, t.expimp) r
#              LEFT JOIN
#              (SELECT group_concat(distinct replace(reporting_slug,",","")) as reportings,partner_slug,year,expimp
#              FROM flow_joined
#              Where flow is not NULL
#              GROUP BY  partner_slug, year,expimp) t1
#              ON r.reporting_id=t1.partner_slug and r.year =t1.year and r.expimp!=t1.expimp) tot
#              GROUP BY  tot.reporting_id, tot.year
#              UNION ALL
             # SELECT reporting_id,reporting as reporting, group_concat(flow,"|") as flow, group_concat(expimp,"|") as expimp, group_concat(partner,"|") as partner,
             # year,group_concat(type,"|") as type,group_concat(source,"|")as source, count(distinct source)as source_count,
             # reporting_continent, reporting_type, "world" as partnertype,group_concat(mirror_partner,"|") as mirror_partner
             # FROM
             # (SELECT t.reporting_slug as reporting_id, reporting, flow,  t.expimp as expimp,
             # t.partner as partner, t.year as year, type, source, reporting_continent, reporting_type,(t1.reportings ||"+"|| t1.expimp) as mirror_partner
             # FROM
             # (SELECT reporting, reporting_slug, flow*Unit/ifnull(rate,1) as flow, group_concat(partner,"+") as partner, year,group_concat(source,"+") as source, group_concat(type,"+") as type, reporting_continent,reporting_type, expimp
             # FROM flow_joined
             # WHERE flow is not NULL
             # AND(partner_slug like 'Worldestimated'
             # OR partner_slug like 'Worldasreported'
             # OR partner_slug like 'Worldsumpartners'
             # OR partner_slug like 'WorldFedericoTena')
             # GROUP BY  reporting_slug,year,expimp) t
             # LEFT JOIN
             # (SELECT group_concat(distinct replace(reporting_slug,",","")) as reportings,partner_slug,year,expimp
             # FROM flow_joined
             # Where flow*Unit/rate is not NULL
             # GROUP BY  partner_slug, year,expimp) t1
             # ON t.reporting_slug=t1.partner_slug and t.year =t1.year and t.expimp!=t1.expimp)
             # Group by reporting_id, year
# 			""")

# print "metadata created"
# print "-------------------------------------------------------------------------"


################################################################################
##			Create table metadata bilateral
################################################################################

# print "Create table metadata_bilateral"
# print "-------------------------------------------------------------------------"

c.execute("""DROP TABLE IF EXISTS metadata_bilateral;""")
c.execute("""CREATE TABLE IF NOT EXISTS metadata_bilateral AS
	 		 SELECT tot.reporting_id as reporting_id, tot.reporting as reporting, group_concat(tot.flow,"|") as flow,  group_concat(tot.expimp,"|") as expimp,
			 group_concat(tot.partner,"|") as partner, tot.year as year,
             group_concat(tot.type,"|") as sourcetype,  group_concat(tot.source,"|")  as source,count(distinct tot.source) as source_count,
             tot.reporting_continent as reporting_continent, tot.reporting_type as reporting_type,group_concat(mirror_partner,"|") as mirror_partner
             from
             (SELECT reporting_id, reporting, flow, r.expimp as expimp,
             partner as partner, r.year as year, type, source, reporting_continent, reporting_type,(t1.reportings ||"+"|| t1.expimp) as mirror_partner
             FROM
             (select t.reporting_slug as reporting_id,t.reporting as reporting, sum(t.flow) as flow, t.expimp as expimp, group_concat(t.partner_slug) as partner,
             t.year as year, t.reporting_continent as reporting_continent, t.reporting_type as reporting_type,group_concat(distinct t.type) as type,group_concat(distinct t.source)  as source
             FROM
             (SELECT reporting, reporting_slug, flow*Unit/ifnull(rate,1) as flow, (replace(partner_slug,",","")||"+"||partner_continent) as partner_slug, year, source, type,reporting_continent,reporting_type, expimp
             FROM flow_joined
             WHERE partner_slug NOT LIKE 'World%' 
             AND flow*Unit/rate is not NULL
             AND partner_continent is not NULL
             GROUP BY  reporting_slug, partner_slug,year,expimp) t
             Group by t.reporting_slug, t.year, t.expimp) r
             LEFT JOIN
             (SELECT group_concat(distinct replace(reporting_slug,",","")) as reportings,partner_slug,year,expimp
             FROM flow_joined
             Where flow is not NULL
             GROUP BY  partner_slug, year,expimp) t1
             ON r.reporting_id=t1.partner_slug and r.year =t1.year and r.expimp!=t1.expimp) tot
             GROUP BY  tot.reporting_id, tot.year
			""")

print "metadata_bilateral created"
print "-------------------------------------------------------------------------"

################################################################################
##			Create table metadata world
################################################################################

# print "Create table metadata_world"
# print "-------------------------------------------------------------------------"

c.execute("""DROP TABLE IF EXISTS metadata_world;""")
c.execute("""CREATE TABLE IF NOT EXISTS metadata_world AS
	 		SELECT reporting_slug,reporting as reporting, group_concat(flow,"|") as flow, group_concat(expimp,"|") as expimp, group_concat(partner,"|") as partner,
			year,group_concat(type,"|") as type,group_concat(source,"|")as source, count(distinct source)as source_count,
			reporting_continent, reporting_type
			From
			(SELECT reporting, reporting_slug, flow*Unit/ifnull(rate,1) as flow, group_concat(partner,"+") as partner, year,group_concat(source,"+") as source, group_concat(type,"+") as type, reporting_continent,reporting_type, expimp
			FROM flow_joined
			WHERE flow is not NULL
			AND(partner_slug like 'Worldestimated'
			OR partner_slug like 'Worldasreported'
			OR partner_slug like 'Worldsumpartners'
			OR partner_slug like 'WorldFedericoTena')
			GROUP BY  reporting_slug,year,expimp)
			Group by reporting_slug, year
			""")

print "metadata_world created"
print "-------------------------------------------------------------------------"
conn.commit()


