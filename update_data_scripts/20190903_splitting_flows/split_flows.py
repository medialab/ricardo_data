#!/usr/bin/env python3
import csv
import itertools
import os


with open('../../data/flows.csv', 'r', encoding='utf8') as f:
    flows = csv.DictReader(f)
    fieldnames = flows.fieldnames
    os.makedirs('../../data/flows',exist_ok=True)
    source_key = lambda f:f['source']
    flows = sorted(flows, key=source_key)
    sumup = []
    for (source, flows) in itertools.groupby(flows, key=source_key):
        # write in separate csv files
        with open('../../data/flows/%s.csv'%source, 'w', encoding='utf8') as output_f:
            output_csv = csv.DictWriter(output_f,fieldnames=fieldnames)
            output_csv.writeheader()
            flows = list(flows)
            output_csv.writerows(flows)
            print('written %s flows to %s'%(len(flows), source))
            sumup.append({'source': source, 'nb_flows': len(flows)})
    with open('./source_nb_flows.csv','w', encoding='utf8') as sumup_f:
        index = csv.DictWriter(sumup_f, fieldnames = ['source','nb_flows'])
        index.writeheader()
        index.writerows(sumup)
