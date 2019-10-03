#!/usr/bin/env python3
import csv
from collections import defaultdict
from datapackage import Package, Resource
import os
import sys
import json
# oh well...
sys.path.append('../../database_scripts/python3')
import utils

with open('../../data/exchange_rates.csv', 'r', encoding='utf8') as f:
    ers = csv.DictReader(f)
    er_sources = set((er['source'] for er in ers))

# preparing source to source file index
with open('../../data/sources.csv', 'r', encoding='utf8') as f: 
    resources = []
    sources = csv.DictReader(f)
    sources_filenames = defaultdict(list)
    for source in sources:
        filename = utils.source_filename(source)
        if os.path.exists('../../data/flows/%s.csv'%filename):
            sources_filenames[filename].append(source)
        else:
            slug = utils.source_slugify(source)
            if slug not in er_sources:
                print('unkown source %s'%slug)

    for filename, sources in sources_filenames.items():
        source = sources[0]
        source_label = utils.source_label(source, False)
        source_resource = {"title":source_label}
        if 'URL' in source and source['URL'] != '':
            source_resource['path'] = source['URL']
        # create a resource
        flows_resource = {
            "name":"flows_%s"%filename.lower(),
            "title": "Trade flows transcribed from: %s"%source_label,
            "format":"csv",
            "encoding":"utf-8",
            "path": "data/flows/%s.csv"%filename,
            "profile": "tabular-data-resource",
            "sources": [source_resource],
            "schema": "./flows_schema.json",
            "group": "flows"
        }
        resources.append(flows_resource)
    with open('./resources.json', 'w', encoding='utf8') as rf:
        json.dump(resources, rf, indent=2)
