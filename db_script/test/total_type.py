import codecs
import os

import json
import sqlite3


def test(cursor):
	cursor.execute("""SELECT count(*)
		FROM flow_joined
		WHERE partner="World_undefined"
		""")
	print "%s undefined type of Total Trade to World"%cursor.fetchone()

	cursor.execute("""SELECT count(*),sum(nb) FROM (SELECT count(*) as nb
		FROM flow_joined
		group by reporting,year,expimp)
		""")
	nb_reporting_annual_flows, total_flows=cursor.fetchone()
	print "%s number of reporting exp or imp total annual flows on %s total"%(nb_reporting_annual_flows,total_flows)


	print "\nrepartition of type of Total Trade to World as duplicates:"

	cursor.execute("""SELECT  count(*) FROM (SELECT count(*) as nb,group_concat(partner,"|") as world_type_group
		FROM flow_joined
		WHERE partner IN ("World_estimated","World_as_reported")
		group by reporting,year,expimp )
		""")
	compatible_world_flows_worldview=cursor.fetchone()[0]
	print "\n%s %.1f%% flows compatible with world view"%(compatible_world_flows_worldview,100*float(compatible_world_flows_worldview)/nb_reporting_annual_flows)

	cursor.execute("""SELECT  count(*) FROM (SELECT count(*) as nb,group_concat(partner,"|") as world_type_group
		FROM flow_joined
		WHERE partner IN ("World_as_reported","World_as_reported2")
		group by reporting,year,expimp )
		""")
	compatible_world_flows_countryview=cursor.fetchone()[0]
	print "%s %.1f%% flows compatible with world view"%(compatible_world_flows_countryview,100*float(compatible_world_flows_countryview)/nb_reporting_annual_flows)

	cursor.execute("""SELECT  count(*) FROM (SELECT count(*) as nb,group_concat(partner,"|") as world_type_group
		FROM flow_joined

		group by reporting,year,expimp )
		WHERE world_type_group="World_undefined"
		group by world_type_group
		""")
	undefined=cursor.fetchone()
	print "%s flows to World with only undefined Total"%(undefined[0] if undefined else 0)
	# missing_world_flows_countryview=0
	# undefined=0

	# for world_type_group,nb in cursor:
	# 	print world_type_group,nb
	# 	if "World_estimated" in world_type_group or "World_as_reported" in world_type_group:
	# 			missing_world_flows_worldview+=nb
	# 	if "World_as_reported2" in world_type_group or "World_as_reported" in world_type_group:
	# 			missing_world_flows_countryview+=nb
	# 	if world_type_group == "World_undefined":
	# 			undefined+=nb
	# print "\n%s %.1f%% flows compatible with world view"%(missing_world_flows_worldview,100*float(missing_world_flows_worldview)/nb_reporting_annual_flows)
	# print "%s %.1f%% flows compatible with country view"%(missing_world_flows_countryview,100*float(missing_world_flows_countryview)/nb_reporting_annual_flows)
	# print "%s Total trade to World flows with no type"%undefined

	print "\nisolating World_undefined-only flows :"

	cursor.execute("""SELECT reporting,count(*),group_concat(year,"|")
		FROM (SELECT reporting,year,group_concat(partner) as partners_group
		FROM flow_joined
		WHERE partner IN ("World_undefined","World_estimated","World_as_reported","World_as_reported2")
		group by reporting,year,expimp )
		WHERE partners_group="World_undefined"
		group by reporting
		""")
	for f in cursor:
		print "Reporting: %s, %s cases, years: %s"%f
	return True
