import csv, re

ricslug = lambda _: re.sub("[ ()/]","",re.sub("&","_",_))

with open('../../data/RICentities.csv', 'r', encoding='utf8') as f, open('./SAGEO_RICardo_nodes.csv', 'w', encoding='utf8') as of:
    entities = csv.DictReader(f)
    sageo_nodes = csv.DictWriter(of, fieldnames=['id', 'name', 'type', 'continent', 'lat', 'long', 'wikidata'])
    translate = lambda e: {'id': ricslug(e['RICname']),
        'name':e['RICname'],
        'type':e['type'],
        'continent': e['continent'],
        'lat':e['lat'],
        'long':e['lng'],
        'wikidata':e['wikidata']
    }
    sageo_nodes.writeheader()
    sageo_nodes.writerows(translate(e) for e in entities if e['lat'] != '')
