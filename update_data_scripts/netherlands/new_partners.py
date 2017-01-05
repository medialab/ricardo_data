import csvkit
import sqlite3


conn=sqlite3.connect("../../sqlite_data/RICardo.sqlite")
c=conn.cursor()
c2=conn.cursor()

with open("new_partners.csv","r") as f :
	patch=csvkit.DictReader(f)
	for p in patch:
		c.execute("SELECT original_name from entity_names WHERE RICname=? LIMIT 1",(p["partner_ric"],))
		for r in c:
			print "RCI %s : original %s"%(p["partner_ric"],r[0])
			c2.execute("UPDATE flows SET partner=?,special_general='spe' WHERE id=?",(r[0],p['id']))
conn.commit()