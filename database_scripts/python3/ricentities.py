import csv
import time
import os
import requests
import utils
from shapely.geometry import MultiPoint
from pyproj import Proj

def geolocalize_RICentities(datadir = '../../data', group= False, replace = True):
    wgs84 = Proj("epsg:4326")
    with open(os.path.join(datadir,'RICentities.csv'), 'r', encoding='UTF8') as f, open('RICentities_geoloc.csv', 'w', encoding='UTF8') as of:
        entities = csv.DictReader(f)
        entities_geoloc = csv.DictWriter(of, fieldnames=entities.fieldnames)
        entities_geoloc.writeheader()
        group_entities = []
        entities_index = {}
        for entity in entities:
            if entity['wikidata'] and entity['wikidata'] != '' and entity['lat'] == '':
                req = requests.get('https://www.wikidata.org/wiki/Special:EntityData/%s.json'%entity['wikidata'])
                if req.status_code == 200:
                    wikidata = req.json()
                    #geoloc
                    try:
                        geoloc = wikidata['entities'][entity['wikidata']]['claims']['P625'][0]['mainsnak']['datavalue']['value']
                        lat = geoloc['latitude']
                        lng = geoloc['longitude']
                        entity['lat'] = lat
                        entity['lng'] = lng
                        print('ok, %s,%s,%s/%s'%(entity['RICname'],entity['wikidata'],lat, lng))
                    except KeyError as e: 
                        print('error,%s,%s,%s'%(entity['RICname'],entity['wikidata'],e))
                    #throttle
                    time.sleep(0.6)
            if entity['type'] == 'group':
                # group to be geolocalized
                group_entities.append(entity)
            entities_index[entity['RICname']] = entity
        if group:
            for entity in group_entities:
                # decompose group
                subentities = entity['RICname'].split(' & ')
                # filter only those which has coordinates
                try:
                    geoloc_subentities = [(wgs84(float(entities_index[s]['lng']), float(entities_index[s]['lat']), errcheck=True)) for s in subentities if s in entities_index and entities_index[s]['lat'] != '']
                    if len(geoloc_subentities) > 0:
                        # calculate centroid of subentities polygon
                        centroid = MultiPoint(geoloc_subentities).convex_hull.centroid
                        entity['lng'], entity['lat'] = wgs84(centroid.x, centroid.y, inverse=True)
                        print('ok,%s,,%s/%s from %s on %s subs'%(entity['RICname'],entity['lat'], entity['lng'], len(geoloc_subentities), len(subentities)))
                    else:
                        print('error,%s,,%s geoloc on %s subs'%(entity['RICname'], len(geoloc_subentities), len(subentities)))
                except Exception as e:
                    print(entity['RICname'])
                    print(e)
                    print([(float(entities_index[s]['lat']), float(entities_index[s]['lng'])) for s in subentities if s in entities_index and entities_index[s]['lat'] != ''])
        # write to output file
        entities_geoloc.writerows(entities_index.values())
    # replace file
    if replace :
        os.remove(os.path.join(datadir,'RICentities.csv'))
        os.rename('RICentities_geoloc.csv',os.path.join(datadir,'RICentities.csv'))




# it's actually harder than I thought to identify deprecated RICentities, I comment that out as it may discard usefull entities
# def filter_unused_RICentities(datadir = '../../data'):
#     with open(os.path.join(datadir,'RICentities.csv'), 'r+', encoding='UTF8') as f, open(os.path.join(datadir,'entity_names.csv')) as en_f:
#         entities = csv.DictReader(f)
#         entities_fieldnames = entities.fieldnames
#         entities = list(entities)
#         entity_names = csv.DictReader(en_f)
#         unused = set(e['RICname'] for e in entities if e['COW_code'] == '')- set(en['RICname'] for en in entity_names)
#         print("%s unused RICentities will be filtered out: %s"%(len(unused),unused))
#         f.seek(0)
#         entities_filtered = [e for e in entities if e['RICname'] not in unused]
#         new_entities = csv.DictWriter(f, fieldnames = entities_fieldnames)
#         new_entities.writeheader()
#         new_entities.writerows(entities_filtered)
#         print("wrote %s entities in RICentities.csv"%len(entities_filtered))

geolocalize_RICentities(datadir='../../data/', group=True, replace = False)