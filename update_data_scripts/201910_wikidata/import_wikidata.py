#!/usr/bin/python3
import csv

#load RICentities
RICentities_index = dict()
RICentities_fieldnames = []
RICentities_rows = []
with open('../../data/RICentities.csv', 'r', encoding='utf8') as f:
    RICentities = csv.DictReader(f)
    RICentities_fieldnames = RICentities.fieldnames + ['wikidata', 'lat', 'lng']
    for RICentity in RICentities:
        RICentities_index[RICentity['RICname']] = RICentity
        RICentities_rows.append(RICentity)


with open('./RICname_wikidata.csv', 'r', encoding='utf8') as f:
    rw = csv.DictReader(f)
    for row in rw:
        if row['RICname'] not in RICentities_index:
            print("can't find '%s'"%row['RICname'])
        else:
            RICentities_index[row['RICname']]['wikidata'] = row['wikidata'].strip().split('/')[-1]

with open('./RICname_wikidata_2.csv', 'r', encoding='utf8') as f:
    rw = csv.DictReader(f)
    for row in rw:
        if row['RICname'] not in RICentities_index:
            print("can't find '%s'"%row['RICname'])
        else:
            RICentities_index[row['RICname']]['wikidata'] = row['wikidata']
            if row['lat'] != '':
                RICentities_index[row['RICname']]['lat'] = row['lat']
                RICentities_index[row['RICname']]['lng'] = row['lng']


with open('./RICentities.csv', 'w', encoding='utf8') as f:
    RICentities = csv.DictWriter(f,fieldnames=RICentities_fieldnames)
    RICentities.writeheader()
    RICentities.writerows(RICentities_rows)