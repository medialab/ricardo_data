#!/usr/bin/env python3
import csv
import itertools
import os
import sys
# oh well...
sys.path.append('../../database_scripts/python3')
import utils

# preparing source to source file index
with open('../../data/sources.csv', 'r', encoding='utf8') as f: 
    sources = csv.DictReader(f)
    sources_filenames = {}
    for source in sources:
        sources_filenames[source['slug']] = utils.source_filename(source)
    # splitting flows
    with open('../../data/flows.csv', 'r', encoding='utf8') as f:
        flows = csv.DictReader(f)
        fieldnames = flows.fieldnames
        os.makedirs('../../data/flows', exist_ok=True)
        source_key = lambda f : sources_filenames[f['source']]
        flows = sorted(flows, key=source_key)
        sumup = []
        for (source_filename, flows) in itertools.groupby(flows, key=source_key):
            # write in separate csv files
            with open('../../data/flows/%s.csv'%source_filename, 'w', encoding='utf8') as output_f:
                output_csv = csv.DictWriter(output_f,fieldnames=fieldnames)
                output_csv.writeheader()
                flows = list(flows)
                output_csv.writerows(flows)
                print('written %s flows to %s'%(len(flows), source_filename))
                sumup.append({'source_filename': source_filename, 'nb_flows': len(flows)})
        with open('./source_nb_flows.csv','w', encoding='utf8') as sumup_f:
            index = csv.DictWriter(sumup_f, fieldnames = ['source_filename','nb_flows'])
            index.writeheader()
            index.writerows(sumup)
