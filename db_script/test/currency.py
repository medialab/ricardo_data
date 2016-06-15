# coding=utf8
import sqlite3
import codecs
import os

def test(cursor):
	#
	cursor.execute("""SELECT year,currency,reporting
						FROM flows
						GROUP BY year, currency, reporting""")

	initial_currency_years=[]
	for y, c, r in cursor:
	 	#print str(int(y))+" "+c.encode("UTF8")
	 	initial_currency_years.append((y,c.lower().strip(),r.lower().strip()))
	print "total number of currencies in flows %s"%len(initial_currency_years)

	cursor.execute("""SELECT c.year, c.currency, c.modified_currency, c.reporting
					FROM currencies c
					GROUP BY c.year, c.currency, c.reporting
						""")
	modified_currency={}
	for y, i_c, m_c, r in cursor:
		modified_currency[(y,i_c.lower().strip(), r.lower().strip())]=(m_c.lower().strip())

	#LEFT JOIN rate r USING (year,modified_currency)
	print "check number before/after set currency : %s/%s"%(len(initial_currency_years),len(set(initial_currency_years)))
	print "check number before/after set modified_currency : %s/%s"%(len(modified_currency.keys()),len(set(modified_currency.keys())))

	incurrencynotinflow=set(modified_currency.keys())-set(initial_currency_years)
	print "in currencies not in flows %s"%len(incurrencynotinflow)

	inflownotincurrency=set(initial_currency_years)-set(modified_currency.keys())
	print "in flows not in currencies %s"%len(inflownotincurrency)

	inflowincurrency=set(initial_currency_years)&set(modified_currency.keys())
	print "in flows and in currencies %s"%len(inflowincurrency)

	if len(inflownotincurrency):
		with codecs.open(os.path.join("..","out_data","missings_rates.csv"),"w",encoding="UTF8") as csv_f:
		 	csv_f.write('"year", "currency", "reporting"\n')
		 	for t in inflownotincurrency:
		 		csv_f.write("%s,%s, %s\n"%t)

	cursor.execute("""SELECT r.year, r.modified_currency ,r.rate_to_pounds
		from exchange_rates as r
		where rate_to_pounds is not null""")

	rates={}
	for y,m_c,r in cursor:
		rates[(y,m_c.lower().strip())]=r

	inflowincurrency_rate=[]
	unknown_rates=[]
	for y, m_c, i_c, r in ((y,modified_currency[(y,i_c,r)],i_c,r) for (y,i_c, r) in inflowincurrency):
		try:
			inflowincurrency_rate.append((y,i_c,r,m_c,rates[(y,m_c)]))
		except:
			unknown_rates.append((y,m_c))

	print "in flow in currency not in exchange_rates %s"%len(unknown_rates)
	print "total known currencies in flows %s"%len(inflowincurrency_rate)

	#check twice
	cursor.execute("""SELECT count(*), modified_currency, year
						FROM
						(SELECT *
						from flows as f
						LEFT OUTER JOIN currencies as c
						ON f.currency=c.currency
						   AND f.year=c.year
						LEFT OUTER JOIN exchange_rates as r USING (year, modified_currency)
						WHERE rate_to_pounds is null
						)
						WHERE rate_to_pounds is null
						GROUP BY modified_currency,year
					""")

	if len(list(cursor))==len(unknown_rates):
		with codecs.open(os.path.join("..","out_data","missings_rates.csv"),"w",encoding="UTF8") as csv_f:
		 	csv_f.write('"year","modified_currency"\n')
		 	for t in unknown_rates:
		 		csv_f.write("%s,%s\n"%t)
		print "missing rates exported in out_data"
		return True
	else:
		print "test verification with alternative method failed !"
		return False
