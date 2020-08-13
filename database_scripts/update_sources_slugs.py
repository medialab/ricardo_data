#!/usr/bin/env python3
import csv
import utils
import os

# Maintenance script to upadte the slug used as foreingkey between data and the source table
# For readibility, the slug is built from the source metadata.
# Therefore correcting the metadata implies to change the slugs in both flows and exchange rates tables.

flows_queries = "" 
exchange_rates_queries = ""
sources_queries = ""
# read the source table
with open('../../data/sources.csv', 'r', encoding='utf8') as sources_f:
    sources = csv.DictReader(sources_f)
    
    for source in sources:
        # generate slugs
        new_slug = utils.source_slugify(source)
        if new_slug != source['slug']:
            print("replacing %s by %s"%(source['slug'], new_slug))
            ## if different, update flow and exchange_rate tables
            flows_queries += 'UPDATE flows SET source="%s" WHERE source="%s";'%(new_slug, source['slug'])
            exchange_rates_queries += 'UPDATE exchange_rates SET source="%s" WHERE source="%s";'%(new_slug, source['slug'])
            sources_queries += 'UPDATE sources SET slug="%s" WHERE slug="%s";'%(new_slug, source['slug'])
# applying the queries rewriting file
## change filename in future
if flows_queries != '':
    print("applying %s to flows: \n"%flows_queries)
    os.system("csvsql --no-inference  ../../data/flows.csv --query '%s SELECT * FROM flows;' > ../../data/flows_updated.csv; mv ../../data/flows_updated.csv ../../data/flows.csv"%flows_queries)
if exchange_rates_queries != '':
    print("applying %s to exchange rates: \n"%exchange_rates_queries)
    os.system("csvsql --no-inference  ../../data/exchange_rates.csv --query '%s SELECT * FROM exchange_rates;' > ../../data/exchange_rates_updated.csv; mv ../../data/exchange_rates_updated.csv ../../data/exchange_rates.csv"%exchange_rates_queries)
if sources_queries != '':
    print("applying %s to sources: \n"%exchange_rates_queries)
    os.system("csvsql --no-inference  ../../data/sources.csv --query '%s SELECT * FROM sources;' > ../../data/sources_updated.csv; mv ../../data/sources_updated.csv ../../data/sources.csv"%sources_queries)
