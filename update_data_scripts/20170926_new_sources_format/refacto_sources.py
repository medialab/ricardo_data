import csvkit
import re
import sqlite3

# utilities
nonLetters = re.compile(r'\W', re.UNICODE)

def slugify(source):
    slug = lambda s : ''.join([re.sub(nonLetters,'',w).capitalize() for w in s.split(' ')])
    fields = ['author','name', 'country', 'volume_date', 'volume_number', 'pages']
    return '_'.join(slug(source[f]) for f in fields if source[f] and slug(source[f]))

# internal configuration

FIELDSTOCOPY = [ 'type', 'author_editor', 'URL']
FIELDSTODISCARD = ['acronym']

# cursor to mysql

conn=sqlite3.connect("../../sqlite_data/RICardo.sqlite")
c=conn.cursor()
# nb_flows by source slug 
c.execute(""" SELECT source,count(*) as nb_flows FROM flows group by source UNION SELECT source, count(*) as nb_flows from exchange_rates group by source""")
nb_flows_by_sources = dict(r for r in c)

slugs = {}
# open source_types
with open('source_types.csv','r') as stfile:
    # create source_types index
    source_types = csvkit.DictReader(stfile)
    source_types = dict((st['acronym'],st) for st in source_types)
    # open sources
    with open('sources.csv', 'r') as sfile:
        sources = list(csvkit.DictReader(sfile))
        # join sources and source_types
        for s in sources:
            # keep fields
            for field in FIELDSTOCOPY: 
                s[field] = source_types[s['acronym']][field]
            # filter out fields
            for field in FIELDSTODISCARD:
                del(s[field])
            # isolate author_editor
            if s['author'] == s['author_editor'] :
                s['author'] = None
            # create a new slug
            s['new_slug'] = slugify(s)
            # control slug unicity
            if s['new_slug'] in slugs:
                slugs[s['new_slug']]+=1
            else :
                slugs[s['new_slug']]=1
        # control slug unicity
        print "%s sources have duplicated slugs"%len([(s,nb) for (s,nb) in slugs.iteritems() if nb > 1])
        for s in sources:
            s['new_slug_nb'] = slugs[s['new_slug']]
            # add nb flows
            s['nb_flows'] = int(nb_flows_by_sources[s['slug']]) if s['slug'] in nb_flows_by_sources else 0
            # add a note and action column
            s['put x to remove']=''
        # export
        with open('new_sources.csv','w') as outputFile:
            print "writing %s line to new_sources.csv"%len(sources)
            headers = ['put x to remove', 'new_slug_nb', 'nb_flows', 'new_slug', 'slug',  'author', 'name', 'author_editor', 'country', 'volume_number', 'volume_date', 'edition_date', 'pages', 'shelf_number', 'source_category', 'URL', 'type', 'notes', 'flow_date' ]
            output = csvkit.DictWriter(outputFile,headers)
            output.writeheader()
            output.writerows(sources)
