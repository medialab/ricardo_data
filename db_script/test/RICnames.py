import codecs
import os

def test(cursor):
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

	return True