import csv
from collections import defaultdict
import json 

COW_entities = defaultdict(dict)
COW_types_by_year = defaultdict(dict)

translate_link_type = {
    "Became part of" : {"slug":"part","priority":2},
    "Became colony of": {"slug":"col","priority":3},
    "Became possession of": {"slug":"poss","priority":3},
    "Became dependency of": {"slug":"dep", "priority":3},
    "Became concession of": {"slug":"cons", "priority":3},
    "Claimed by": {"slug":"claim","priority":0},
    "Became protectorate of": {"slug":"prot","priority":3},
    "Became associated state of": {"slug":"assoc","priority":0},
    "Occupied by": {"slug":"occ","priority":1},
    "Leased to": {"slug":"leas","priority":0},
    "Became neutral or demilitarized zone of": {"slug":"neut","priority":0},
    "Mandated to": {"slug":"mand","priority":0},
    "Sovereign": {"slug":"SOV","priority":4},
    "Unincorporated territory": {"slug":"uninc","priority":0},
    "Autonomous constituent country of": {"slug":"autonom","priority":0},
    "Sovereign (unrecognised)": {"slug":"SOV_U","priority":0},
    "Sovereign (limited)": {"slug":"SOV_L","priority":1},
    "International":  {"slug":"int","priority":3},
    "Informal":  {"slug":"inf","priority":2},
    "Protected area of": {"slug":"protected","priority":0},
    "Unknown": {"slug":"N/A","priority":0}
}



minYear = 1816
maxYear = 2019
                
with open('./COW_Entities_extended.csv', 'r', encoding='utf8') as r:
    COW_links = csv.DictReader(r)

    for link in COW_links:
        print(link)
        if link['link_type'] == '':
            continue
        link = dict((k,v.replace('\n','').strip()) for k,v in  link.items())
        if link['COW_code'] not in COW_entities:
            COW_entities[link['COW_code']]['name'] = link['COW_name']
            COW_entities[link['COW_code']]['years'] = {}
        if link['end_year'] == '':
            link['end_year'] = maxYear
        if link['start_year'] == '':
            link['start_year'] = minYear
        if link['start_year'] == '?' or link['end_year'] == '?':
            print(link)
            continue

        for y in range(int(link['start_year']), int(link['end_year'])+1):
            COW_types_by_year[link['link_type']][y] = COW_types_by_year[link['link_type']][y] + 1 if y in COW_types_by_year[link['link_type']] else 1
            if y not in COW_entities[link['COW_code']]['years']:
                COW_entities[link['COW_code']]['years'][y] = []
            
            COW_entities[link['COW_code']]['years'][y].append({
                "status": link['link_type'],
                "sovereign": link['sovereign_COW_code']
                })
            

    with open('./COW_Entities_extended.json', 'w', encoding='utf8') as f:
        json.dump(COW_entities, f, indent=2)     

    with open('./COW_Entities_in_time.csv', 'w', encoding='utf8') as o:
        fieldnames = ['COW_name', 'COW_id'] + list(range(minYear, maxYear+1))
        output = csv.DictWriter(o, fieldnames=fieldnames)
        output.writeheader()
        for number, e in COW_entities.items():
            line = { 'COW_name':e['name'],
              'COW_id':number}
            for y in range(minYear, maxYear+1):
                if y in e['years'] :
                    line[y] = " | ".join([translate_link_type[o]["slug"] for o in sorted((o['status'] for o in e['years'][y]), key=lambda o : -1*translate_link_type[o]['priority'])])
                else :
                    line[y] = ''
            output.writerow(line) 
    with open('./COW_Entities_types_in_time.csv', 'w', encoding='utf8') as o:
        fieldnames = ['COW_type'] + list(range(minYear, maxYear+1))
        output = csv.DictWriter(o, fieldnames=fieldnames)
        output.writeheader()
        for ctype, years in COW_types_by_year.items():
            print(ctype,years)
            line = { 'COW_type': ctype}
            for y in range(minYear, maxYear+1):
                line[y] = years[y] if y in years else 0
            output.writerow(line) 

    # one line by COW entities
    # one column by year