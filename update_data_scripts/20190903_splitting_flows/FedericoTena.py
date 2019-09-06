import csvkit
import os
import json
import re


# create flows
def import_flows(filename,imp_exp,c,ft_entities,ft_rates,ft_source):
	with open(filename) as f:
		importscsvs=csvkit.DictReader(f)
		for line in importscsvs:
			year=line["year"]
			for reporting,flow in line.iteritems():
				if flow !="":
					try:
						flow=float(flow.replace(",","."))*ft_rates[year]
					except :
						print year,reporting,"'%s'"%flow
						continue
					# remove 0 values
					if reporting!="year" and flow!=0.0:
						reporting = reporting.strip().lower()
						if reporting in ft_entities:
							data=[ft_source,flow,"1000000","us dollar",int(year),reporting,"World Federico-Tena",imp_exp,"gen","total_federicotena"]
							c.execute("INSERT INTO flows (source, flow, unit, currency, year, reporting, partner, export_import, special_general, world_trade_type) VALUES (?,?,?,?,?,?,?,?,?,?)",data)
							data=["us dollar",int(year),reporting,"us dollar"]
							c.execute("INSERT OR IGNORE INTO currencies (currency, year, reporting, modified_currency) VALUES (?,?,?,?)",data)
						else:
							print "MISSING '%s' in ft entities"%reporting

def import_federicotena(c):
	FT_PATH = "FedericoTena_data"
	ENTITIES_CSV = "FredericoTena_entities.csv"
	IMPORTS_CSV = "FredericoTena_imports.csv"
	EXPORTS_CSV = "FredericoTena_exports.csv"
	RATES_CSV = "FredericoTena_rates.csv"
	



	# create source done
	nonLetters = re.compile(r'\W', re.UNICODE)
	
	def slugify(source):
	    slug = lambda s : ''.join([re.sub(nonLetters,'',w).capitalize() for w in s.split(' ')])
	    fields = ['author','name', 'country', 'volume_date', 'volume_number', 'pages']
	    return '_'.join(slug(source[f]) for f in fields if f in source and source[f] and slug(source[f]))

	FT_source = {
		'author': "Federico G. & A. Tena-Junguito",
		"name": "World trade, 1800-1938: a new data-set, EHES Working Paper 93",
		"type": "FedericoTena",
		"edition_date": "2016",
		"URL": "http://www.ehes.org/EHES_93.pdf"
	}
	FT_source['slug'] = slugify(FT_source) 

	c.execute("INSERT INTO sources (slug, name, edition_date, type, author, URL) VALUES (?,?,?,?,?,?)",(FT_source['slug'], FT_source['name'], FT_source['edition_date'], FT_source['type'], FT_source['author'], FT_source['URL']))
	print "created FT source"

	# read entities

	ricslug=lambda _: re.sub("[ ()/]","",re.sub("&","_",_))

	ft_entities=[]
	with open(os.path.join(FT_PATH,ENTITIES_CSV)) as f:
		entitiescsv=csvkit.DictReader(f)
		for entity in entitiescsv:
			if entity["new"]!="":
				# create new entities
				print "inserting new entity %s"%entity["ricname"]
				# todo add continent
				c.execute("INSERT OR IGNORE INTO RICentities (RICname,type,continent,COW_code,slug) VALUES (?,?,?,?,?)",(entity["ricname"],entity["rictype"],entity["continent"],entity["cow"],ricslug(entity["ricname"])))
				# todo check for the group
			c.execute("INSERT OR IGNORE INTO entity_names (original_name,RICname) VALUES (?,?) ",(entity["Polity Federico-Tena"].strip().lower(),entity["ricname"]))
			ft_entities.append(entity["Polity Federico-Tena"].strip().lower())
	# add World Frederico Tena entity
	c.execute("INSERT OR IGNORE INTO entity_names (original_name,RICname) VALUES (?,?) ",("World Federico-Tena","World Federico Tena"))
	c.execute("""INSERT OR IGNORE INTO RICentities (RICname,type,continent,slug) VALUES ("World Federico Tena","geographical_area","World", "WorldFedericoTena")""")
	
	# read rate to dollar
	ft_rates={}
	with open(os.path.join(FT_PATH,RATES_CSV)) as f:
		ratescsv=csvkit.DictReader(f)
		for line in ratescsv:
			ft_rates[line["year"]]=float(line["rate_to_dollar"])

	# read import
	import_flows(os.path.join(FT_PATH,IMPORTS_CSV),"imp",c,ft_entities,ft_rates,FT_source['slug'])
	# read export
	import_flows(os.path.join(FT_PATH,EXPORTS_CSV),"exp",c,ft_entities,ft_rates,FT_source['slug'])

