# coding=utf8
import json
import os
import utils

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