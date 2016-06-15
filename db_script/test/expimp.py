# coding=utf8


def test(cursor):
	cursor.execute("""  SELECT flows.*, eisg.modified_export_import as expimp, eisg.modified_special_general as spegen
					  	from flows
					  	LEFT OUTER JOIN expimp_spegen as eisg USING (export_import, special_general)
					  	WHERE eisg.modified_export_import is null AND eisg.modified_special_general is null
					  """)

	missings_expimp=cursor.fetchall()
	print "missing expimp spe/gen in standards :%s"%len(missings_expimp)
	if len(missings_expimp)==0:
		return True
	else:
		for t in missings_expimp:
			print t