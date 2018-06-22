import codecs
import os

def test(cursor):
	# reportings in flows -> entity_names -> RICentities check
	cursor.execute("""SELECT reporting,r.RICname,r2.RICname
	 from flows
	 LEFT OUTER JOIN entity_names as r ON reporting=r.original_name COLLATE NOCASE
	 LEFT OUTER JOIN RICentities r2 ON r2.RICname=r.RICname
	 WHERE r2.RICname is null
	 GROUP BY reporting""")
	missing_reportings_in_RICnames= list(cursor)
	print "%s missing reporting in RICnames"%len(missing_reportings_in_RICnames)
	with codecs.open(os.path.join("..","out_data","missings_reporting_in_ricnames.csv"),"w",encoding="UTF8") as f:
		f.write('"original partner name","modified name","RICname in table2","RICname in table3"\n')
		for r in missing_reportings_in_RICnames:
			f.write('"'+'","'.join(unicode(_) for _ in r)+'"\n')

	# partners in flows -> entity_names -> RICentities check
	cursor.execute("""SELECT partner,p.RICname,p2.RICname
	 from flows
	 LEFT OUTER JOIN entity_names as p ON trim(partner)=p.original_name COLLATE NOCASE
	 LEFT OUTER JOIN RICentities p2 ON p2.RICname=p.RICname
	 WHERE p2.RICname is null
	 GROUP BY partner""")
	missing_partners_in_RICnames= list(cursor)
	print "%s missing partners in RICnames"%len(missing_partners_in_RICnames)
	with codecs.open(os.path.join("..","out_data","missings_partners_in_ricnames.csv"),"w",encoding="UTF8") as f:
		f.write('"original partner name","modified name","RICname in table2","RICname in table3"\n')
		for r in missing_partners_in_RICnames:
			f.write('"'+'","'.join(unicode(_) for _ in r)+'"\n')
		print "missings written in out_data"

	def test(title,sql,cursor):
		cursor.execute(sql)
		r = list(cursor)
		if len(r) > 0:
			result = 'NOT PASSED'
			for l in r:
				print l
		else:
			result = 'PASSED'
		print "%s: %s"%(title,result)	

	# part_of_country
	test('part_of_country of countries should be empty',
		"""SELECT *
		 	from RICentities
		 	WHERE type = 'country' AND part_of_country is not null""",
		 cursor)
	test('COW_code mandatory for countries',
		"""SELECT *
			 from RICentities
			 WHERE type = 'country' AND COW_code is null""",
		 cursor)	
	test('COW_code empty for non countries',
		"""SELECT *
			 from RICentities
			 WHERE type != 'country' AND COW_code is not null""",
		 cursor)	
	test('part_of_country must be a RICEntity country',
		"""SELECT *
			 from RICentities as r
			 	LEFT JOIN RICentities as r2 ON r2.RICname = r.part_of_country
			 WHERE r.part_of_country not null AND r2.RICname is not null AND r2.type != 'country'""",
		 cursor)
	test('part_of_country mandatory for colonial_area and city/part_of',
		"""SELECT *
			 from RICentities 
			 WHERE type IN ('colonial_area','city/part_of') AND part_of_country is null""",
		 cursor)