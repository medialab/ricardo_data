import csv
from collections import defaultdict
import json 

COW_entities = defaultdict(dict)
COW_types_by_year = defaultdict(dict)

translate_link_type = {
    "Became part of" : "part",
    "Became colony of": "col",
    "Became possession of": "poss",
    "Claimed by": "claim",
    "Became protectorate of": "prot",
    "Occupied by": "occ",
    "Leased to": "leas",
    "Became neutral or demilitarized zone of": "neut",
    "Mandated to": "mand"
}

with open('./COW_State_2016.csv', encoding='utf8') as r:
    COW_states = csv.DictReader(r)
    for COW_state in COW_states:
        if COW_state['ccode'] not in COW_entities:
            COW_entities[COW_state['ccode']]['name'] = COW_state['statenme']
            COW_entities[COW_state['ccode']]['sovereign'] = {}
            COW_entities[COW_state['ccode']]['years'] = dict((year, 'SOV') for year in range(int(COW_state['styear']), int(COW_state['endyear'])+1))
            for year in range(int(COW_state['styear']), int(COW_state['endyear'])+1):
                COW_types_by_year['SOV'][year] = COW_types_by_year['SOV'][year] + 1 if year in COW_types_by_year['SOV'] else 1
        else:
            for year in range(int(COW_state['styear']), int(COW_state['endyear'])+1):
                COW_types_by_year['SOV'][year] = COW_types_by_year['SOV'][year] + 1 if year in COW_types_by_year['SOV'] else 1
                COW_entities[COW_state['ccode']]['years']['year'] = 'SOV'
                
with open('./COW_Entities_2016_rev.csv', 'r', encoding='utf8') as r:
    COW_links = csv.DictReader(r)

    for link in COW_links:
        link = dict((k,v.replace('\n','')) for k,v in  link.items())
        if link['Entity Number'] not in COW_entities:
            COW_entities[link['Entity Number']]['name'] = link['Name']
            COW_entities[link['Entity Number']]['years'] = {}
            COW_entities[link['Entity Number']]['sovereign'] = {}
        if link['End Year'] == '':
            if link['Begin Year'] == '':
                # ??
                print(link)
                continue
            else :
                link['End Year'] = link['Begin Year']
        for y in range(int(link['Begin Year']), int(link['End Year'])+1):
            COW_types_by_year[link['Ending Political Status']][y] = COW_types_by_year[link['Ending Political Status']][y] + 1 if y in COW_types_by_year[link['Ending Political Status']] else 1
            COW_entities[link['Entity Number']]['years'][y] = translate_link_type[link['Ending Political Status']]
            COW_entities[link['Entity Number']]['sovereign'][y] = link['Sovereign Entity Number']
    with open('./COW_Entities_2016.json', 'w', encoding='utf8') as f:
        json.dump(COW_entities, f, indent=2)     
    minYear = 1816
    maxYear = 1945
    with open('./COW_Entities_in_time.csv', 'w', encoding='utf8') as o:
        fieldnames = ['COW_name', 'COW_id'] + list(range(minYear, maxYear+1))
        output = csv.DictWriter(o, fieldnames=fieldnames)
        output.writeheader()
        for number, e in COW_entities.items():
            line = { 'COW_name':e['name'],
              'COW_id':number}
            for y in range(minYear, maxYear+1):
                line[y] = e['years'][y] if y in e['years'] else ''
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