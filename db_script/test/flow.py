# coding=utf8
import codecs
import os

def test(cursor):

	# and `Partner Entity_Sum` is not null
	# cursor.execute("UPDATE flow SET `Exp / Imp`=trim(lower(`Exp / Imp`)), `Spe/Gen/Tot`=trim(lower(`Spe/Gen/Tot`))")
	# cursor.execute("UPDATE `Exp-Imp-Standard` SET `Exp / Imp`=trim(lower(`Exp / Imp`)), `Spe/Gen/Tot`=trim(lower(`Spe/Gen/Tot`))")

	# for flow in ("flow_joined",) :
	cursor.execute("""SELECT group_concat(id,';'),
						group_concat(`flow`,';'),
						count(*),
						group_concat(spegen,';'),
						group_concat(reporting,';'),
						reporting,
						group_concat(partner,';'),
						partner,
						year,
						expimp,
						group_concat(source,'|')
						from flow_joined
						WHERE partner not LIKE "World%"
						GROUP BY year,expimp,reporting,partner HAVING count(*)>1
						""")
	lines=list(cursor)
	print len(lines)
	nb_spe_gen=0

	nb_dups=0
	reporting_spegen={}
	reporting_dups={}
	log=u'"ids","nb_dup","original_reportings","reporting","original_partner","partner","year","exp_imp","spe_gen","flows","nb_source","sources"\n'
	for ids,flows,n,group,o_r,r,o_p,p,y,e_i,s in lines:
		if group and "Gen" in group and "Spe" in group:
			nb_spe_gen+=n
			reporting_spegen[r]=reporting_spegen.get(r,0)+n
			spegen=False
		else:
			nb_dups+=n
			reporting_dups[r]=reporting_dups.get(r,0)+n
			spegen=True
		# count sources
		sources=set(s.split("|"))
		log+=u'"%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s"\n'%(ids,n,o_r,r,o_p,p,y,e_i,group,flows,len(sources),"|".join(sources))
	# print "# %s"%flow
	print "## Spe/gen Dups"
	print "   number of spe/gen to clean %s"%nb_spe_gen
	print "   reporting countries with spe/gen dups :"
	for k,v in reporting_spegen.iteritems():
		print ("   %s: %s flows"%(k,v)).encode("UTF8")
	print "## dups"
	print "   number of dups to clean %s"%nb_dups
	print "   reporting countries with  dups :"
	for k,v in reporting_dups.iteritems():
		print ("   %s: %s flows"%(k,v)).encode("UTF8")
	with codecs.open(os.path.join("..","out_data","duplicates_in_flow.csv"),"w",encoding="UTF8") as csv:
		csv.write(log)
	return True
	# cursor.execute("""SELECT distinct(Source) from flow""")
	# for s in cursor:
	# 	print s[0].encode("UTF8")

	# SELECT part_dup,group_concat(year)
	# 	FROM (
		# )
		# GROUP BY part_dup
		# 				ORDER BY count(*)

	# cursor.execute("""SELECT max(`flow`),group_concat(reporting,';'),reporting,group_concat(partner,';') as part_dup,partner,year
	# 					from flow_impexp_bilateral
	# 					WHERE reporting = "France"
	# 					GROUP BY year,`Exp / Imp (standard)`,reporting,partner HAVING count(*)>1

	# 					""")
	# for l in cursor:
	# 	print l
		#print ("%s;%s"%(l[0],",".join(sorted(set(l[1].split(",")))))).encode("UTF8")
