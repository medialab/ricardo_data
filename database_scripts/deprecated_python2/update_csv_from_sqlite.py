# coding=utf8
import json
import os
import utils

try :
	conf=json.load(open("config.json","r"))
	database_filename=os.path.join('../sqlite_data',conf["sqlite_filename"])
except Exception as e:
	print e
	print "couldn't load config.json database"
	exit(1)

try:
	if os.path.isfile(database_filename):
		print "exporting sqlite database to CSV" 
		utils.sqlitedatabase2csv(database_filename,"../data")
except:
	print "couldn't find target sqlite database file"
	exit(1)

