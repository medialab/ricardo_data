# coding=utf8
import json
import os
import utils
import sqlite3

try :
	conf=json.load(open("config.json","r"))
	database_filename=os.path.join('../sqlite_data',conf["sqlite_filename"])
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

# conn=sqlite3.connect(database_filename)
# c=conn.cursor()
# c.execute("""UPDATE flows SET source= UPPER(SUBSTR(source, 1, 1)) || SUBSTR(source, 2) """)
# c.execute("""UPDATE sources SET slug= UPPER(SUBSTR(slug, 1, 1)) || SUBSTR(slug, 2) """)
# c.execute("""UPDATE exchange_rates SET source= UPPER(SUBSTR(source, 1, 1)) || SUBSTR(source, 2) """)
# c=conn.commit()
# c=conn.close()