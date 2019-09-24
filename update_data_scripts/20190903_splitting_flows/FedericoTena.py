#!/usr/bin/env python3
import csv
import os
import re
import os

# create flows
def import_flows(filename,imp_exp,ft_entities,ft_rates,ft_source):
	flows_insertions = []
	currencies_insertions = []
	with open(filename, 'r', encoding='utf8') as f:
		importscsvs = csv.DictReader(f)
		for line in importscsvs:
			year = line["year"]
			for reporting,flow in line.items():
				if flow != "":
					try:
						flow = float(flow.replace(",","."))*ft_rates[year]
					except :
						print(year,reporting,"'%s'"%flow)
						continue
					# remove 0 values
					if reporting!="year" and flow!=0.0:
						reporting = reporting.strip().lower()
						if reporting in ft_entities:
							data = {"source": ft_source,
								"flow": flow,
								"unit": "1000000",
								"currency": "us dollar",
								"year": int(year),
								"reporting": reporting,
								"partner": "World Federico-Tena",
								"export_import": imp_exp,
								"special_general": "gen",
								"world_trade_type": "total_federicotena"}
							flows_insertions.append(data)
							data = {"currency":"us dollar", "year":int(year), "reporting": reporting, "modified_currency": "us dollar"}
							currencies_insertions.append(data)
						else:
							print("MISSING '%s' in ft entities"%reporting)
	# writting data
	flows_fieldnames = ["source", "flow", "unit", "currency", "year", "reporting", "partner", "export_import", "special_general", "species_bullions", "transport_type", "statistical_period", "partner_sum", "world_trade_type", "notes"]
	# flows
	print("writting to flows.csv")
	with open('../../data/flows.csv', 'a', encoding='utf8') as flows_f:
		flows_csv = csv.DictWriter(flows_f, fieldnames= flows_fieldnames)
		flows_csv.writerows(flows_insertions)
	# currencies
	currencies_fieldnames = ["currency", "year", "reporting", "modified_currency"]
	print("writting to currencies.csv")
	with open('../../data/currencies.csv', 'a', encoding='utf8') as currencies_f:
		currencies_csv = csv.DictWriter(currencies_f, fieldnames= currencies_fieldnames)
		currencies_csv.writerows(currencies_insertions)

FT_PATH = "FedericoTena_data"
ENTITIES_CSV = "FredericoTena_entities.csv"
IMPORTS_CSV = "FredericoTena_imports.csv"
EXPORTS_CSV = "FredericoTena_exports.csv"
RATES_CSV = "FredericoTena_rates.csv"
FT_source_slug = "FedericoGAndTenajunguitoA_WorldTrade18001938ANewSynthesisRevistaDeHistoriaEconómicajournalOfIberianAndLatinAmericaEconomicHistoryVol37N1" 

# read entities
ricslug=lambda _: re.sub("[ ()/]","",re.sub("&","_",_))

ft_entities=[]
RICentities_insertions = []
entity_names_insertions = []
RICentities_fieldnames = []
with open('../../data/entity_names.csv', 'r', encoding= 'utf8') as entity_names_f:
	entity_names = csv.DictReader(entity_names_f)
	entity_names_fieldnames = entity_names.fieldnames
	entity_names = set(ea['original_name'].strip().lower() for ea in entity_names)
	with open('../../data/RICentities.csv', 'r', encoding='utf8') as RICentities_f:
		RICentities_csv = csv.DictReader(RICentities_f)
		RICentities_fieldnames = RICentities_csv.fieldnames
		RICnames = set(r['RICname'] for r in RICentities_csv)
		with open(os.path.join(FT_PATH,ENTITIES_CSV)) as f:
			entitiescsv=csv.DictReader(f)
			for entity in entitiescsv:
				if entity["Polity Federico-Tena"].strip().lower() not in entity_names:
					print("inserting entity_names %s -> %s"%(entity["Polity Federico-Tena"].strip().lower(), entity["RICname"]))
					entity_names_insertions.append({'original_name':entity["Polity Federico-Tena"].strip().lower(),"RICname": entity["RICname"]})
				ft_entities.append(entity["Polity Federico-Tena"].strip().lower())
				if entity["new"] != "" and entity['RICname'] not in RICnames:
					# create new entities
					print("inserting new entity %s"%entity["RICname"])
					del(entity['new'])
					del(entity['Polity Federico-Tena'])
					RICentities_insertions.append(entity)
					# todo check for the group


# add World Frederico Tena entity
RICentities_insertions.append({"RICname": "World Federico Tena","type": "geographical_area","continent": "World","slug": "WorldFedericoTena"})
entity_names_insertions.append({"original_name": "World Federico-Tena","RICname": "World Federico Tena"})

with open('../../data/RICentities.csv', 'a', encoding='utf8') as RICentities_f:
	RICentities_csv = csv.DictWriter(RICentities_f, fieldnames = RICentities_fieldnames)
	RICentities_csv.writerows(RICentities_insertions)
with open('../../data/entity_names.csv', 'a', encoding='utf8') as entity_names_f:
	entity_names_f = csv.DictWriter(entity_names_f, fieldnames = entity_names_fieldnames)
	entity_names_f.writerows(entity_names_insertions)

# read rates to dollar
ft_rates={}
with open(os.path.join(FT_PATH,RATES_CSV), 'r', encoding='utf8') as f:
	ratescsv = csv.DictReader(f)
	for line in ratescsv:
		ft_rates[line["year"]]=float(line["rate_to_dollar"])

# read import
import_flows(os.path.join(FT_PATH,IMPORTS_CSV),"imp",ft_entities,ft_rates,FT_source_slug)
# read export
import_flows(os.path.join(FT_PATH,EXPORTS_CSV),"exp",ft_entities,ft_rates,FT_source_slug)

