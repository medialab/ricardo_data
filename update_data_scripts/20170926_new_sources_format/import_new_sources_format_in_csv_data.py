#!/usr/bin/python
# -*- coding: utf8 -*-
import csvkit
import itertools
import re

# utilities
nonLetters = re.compile(r'\W', re.UNICODE)

def slugify(source):
    slug = lambda s : ''.join([re.sub(nonLetters,'',w).capitalize() for w in s.split(' ')])
    fields = ['author','name', 'country', 'volume_date', 'volume_number', 'pages']
    return '_'.join(slug(source[f]) for f in fields if source[f] and slug(source[f]))


# read 'new_sources.csv'
with open('new_sources.csv', 'r') as f:
    new_sources = list(csvkit.DictReader(f))
    
    swapSources = {}
    toDeleteSourcesSlugs = []

    # refaire tourner les slugs
    sources = []

    for source in new_sources:

        source['new_slug'] = slugify(source)
        # create swap source slug dictionnary to update flow and currency later based on to be removed column
        swapSources[source['slug']] = slugify(source)
        # remove uneeded lines 
        if source['put x to remove'] == '':
            sources.append(source)

        
    for source in sources : 
        # swap slugs
        source['slug'] = slugify(source)
        source['editor'] = source['author_editor']
        # remove uneeded columns
        for unneededColumn in ['put x to remove', 'new_slug_nb', 'nb_flows','new_slug', 'author_editor', 'flow_date']:
            del source[unneededColumn]

    #vérifier l'unicité des slug
    print "%s : nb de sources"%len(sources)
    uniquSlugsInSwap = set(swapSources.values())
    print "%s nombre de slugs uniques in swap"%len(uniquSlugsInSwap)
    uniquSlugsInSource = set(source['slug'] for source in sources) 
    print "%s nombre de slugs uniques in sources"%len(uniquSlugsInSource)
    print "in swap not in source :"
    print "\n".join([slug.encode('utf8') for slug in uniquSlugsInSwap - uniquSlugsInSource])
    print "\n".join([slug.encode('utf8') for slug,ss in itertools.groupby(sources, lambda s: s['slug']) if len(list(ss))>1])


    # output the new sources file
    with open('sources.csv', 'w') as of:
        output = csvkit.DictWriter(of, sources[0].keys())
        output.writeheader()
        output.writerows(sources)
    

# delete source_types.csv (by hand through git)
    # patch flows and exchange_rates through csvkit directly on csv
    # check for missing sources on the way
    missingSources = set()
    with open('../../csv_data/flows.csv', 'r') as f:
        with open('../../csv_data/new_flows.csv','w') as nf:
            flows = csvkit.DictReader(f)
            newFlows = csvkit.DictWriter(nf, flows.fieldnames)

            for flow in flows:
                if flow['source'] in swapSources:
                    flow['source'] = swapSources[flow['source']]
                else :
                    missingSources.add(flow['source'])
                newFlows.writerow(flow)
 

    with open('../../csv_data/exchange_rates.csv', 'r') as f:
        with open('../../csv_data/new_exchange_rates.csv','w') as nf:
            rates = csvkit.DictReader(f)
            newRates = csvkit.DictWriter(nf, rates.fieldnames)
            for rate in rates:
                if rate['source'] in swapSources:
                    rate['source'] = swapSources[rate['source']]
                else :
                    missingSources.add(rate['source'])
                newRates.writerow(rate)


    with open('missing_sources.list','w') as ms:
        csvkit.writer(ms).writerows([_] for _ in missingSources)

# modify schema (by hand) : done
# try to generate the new database
# test and update sources.csv API
# test and update source representation in client (metadata and data tables)