import csv
from collections import defaultdict, Counter
import json 

COW_entities = defaultdict(dict)
COW_types_by_year = defaultdict(Counter)

translate_link_type = {
    "Dissolved into":  {"slug":"dis" ,"priority":6, "group": "Non sovereign"},
    "Became vassal of": {"slug":"vas","priority":2, "group": "Non sovereign"},
    "Became discovered" : {"slug":"disc","priority":0 , "group": "miscellaneous"},
    "Became part of" : {"slug":"part","priority":0, "group": "Non sovereign"},
    "Became colony of": {"slug":"col","priority":3, "group": "Non sovereign"},
    "Became possession of": {"slug":"poss","priority":3, "group": "Non sovereign"},
    "Became dependency of": {"slug":"dep", "priority":3, "group": "Non sovereign"},
    "Claimed by": {"slug":"claim","priority":1, "group": "Non sovereign"},
    "Became protectorate of": {"slug":"prot","priority":3, "group": "Non sovereign"},
    "Became associated state of": {"slug":"assoc","priority":4, "group": "sovereign (all)"},
    "Occupied by": {"slug":"occ","priority":2, "group": "Non sovereign"},
    "Leased to": {"slug":"leas","priority":2, "group": "Non sovereign"},
    "Became neutral or demilitarized zone of": {"slug":"neut","priority":1, "group": "Non sovereign"},
    "Mandated to": {"slug":"mand","priority":2, "group": "Non sovereign"},
    "Sovereign": {"slug":"SOV","priority":5, "group": "sovereign (all)"},
    "Unincorporated territory": {"slug":"uninc","priority":0, "group": "Non sovereign"},
    "Sovereign (unrecognized)": {"slug":"SOV_U","priority":4, "group": "sovereign (all)"},
    "Sovereign (limited)": {"slug":"SOV_L","priority":4, "group": "sovereign (all)"},
    "International":  {"slug":"int","priority":-1, "group": "Non sovereign"},
    "Informal":  {"slug":"inf","priority":-1, "group": "Non sovereign"},
    "Unknown": {"slug":"N/A","priority":0, "group": "miscellaneous"},
}

periods = [
    {
        "start_year":1816,
        "end_year":1885,
        "transitions": Counter()
    },
    {
        "start_year":1886,
        "end_year":1949,
        "transitions": Counter()
    },
    {
        "start_year":1950,
        "end_year":2019,
        "transitions": Counter()
    },
    {
        "start_year":2020,
        "end_year":2020,
        "transitions": Counter()
    }
]


minYear = 1816
maxYear = 2020
                
with open('../../../data/Political_entities_in_time.csv', 'r', encoding='utf8') as r:
# with open('COW_entities_links_original.csv', 'r', encoding='utf8') as r:
    
    COW_links = csv.DictReader(r)

    for link in COW_links:
      
        if link['link_type'] not in translate_link_type:
              print(link)
              exit(1)
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
            if y not in COW_entities[link['COW_code']]['years']:
                COW_entities[link['COW_code']]['years'][y] = []
            
            COW_entities[link['COW_code']]['years'][y].append({
                "status": link['link_type'],
                "sovereign": link['sovereign_COW_code']
                })

    status_stock_period = []
    years_stock = [p['start_year'] for p in periods]
    get_priority_status = lambda status : sorted((o['status'] for o in status), key=lambda o : -1*translate_link_type[o]['priority'])[0]
    for code,entity in COW_entities.items():            
        year_status = sorted(list(entity['years'].items()), key=lambda e :e[0])
        ssp = {'name': entity['name']}
        for p in periods:
            status = '?'
            for y,s in year_status:
                # attribute to period
                if y >= p['start_year'] and y <= p['end_year']:
                    status = get_priority_status(s)
                    break
            ssp[p['start_year']] = status
        status_stock_period.append(ssp) 
        for p,n in zip(year_status, year_status[1:]):
            previous_status = translate_link_type[get_priority_status(p[1])]['group']
            next_status = translate_link_type[get_priority_status(n[1])]['group']
            
            if previous_status != next_status:
                # status changed
                for p in periods:
                    # attribute to period
                    if n[0] >= p['start_year'] and n[0] <= p['end_year']:
                        p['transitions']["%s>%s"%(previous_status, next_status)]+=1
                        break
    with open('./COW_Entities_extended.json', 'w', encoding='utf8') as f:
        json.dump(COW_entities, f, indent=2)

    with open('./status_transitions_by_periods.json', 'w', encoding='utf8') as f:
        json.dump(periods, f, indent=2)
    with open('./status_transitions_by_periods.csv', 'w', encoding='utf8') as f:
        transitions_csv = csv.DictWriter(f, fieldnames=['period', 'transition', 'nb'])
        transitions_csv.writeheader()
        for p in periods:
            transitions_csv.writerows(({
                'period': '%s-%s'%(p['start_year'], p['end_year']),
                'transition':t,
                'nb':nb } for t,nb in p['transitions'].items()))
    with open('./status_stocks_by_periods.csv', 'w', encoding='utf8') as f:
        status_stock_csv = csv.DictWriter(f, fieldnames=['name']+years_stock)
        status_stock_csv.writeheader()
        status_stock_csv.writerows(status_stock_period)

    with open('./COW_Entities_in_time.csv', 'w', encoding='utf8') as o:
        fieldnames = ['COW_name', 'COW_id'] + list(range(minYear, maxYear+1))
        output = csv.DictWriter(o, fieldnames=fieldnames)
        output.writeheader()
        for number, e in COW_entities.items():
            line = { 'COW_name':e['name'],
              'COW_id':number}
            for y in range(minYear, maxYear+1):
                if y in e['years'] :
                    status_by_priority = sorted((o['status'] for o in e['years'][y]), key=lambda o : -1*translate_link_type[o]['priority'])
                    line[y] = " | ".join([translate_link_type[o]["slug"] for o in status_by_priority])
                    the_status = status_by_priority[0]
                    COW_types_by_year[the_status][y] += 1
                else :
                    line[y] = ''
            output.writerow(line) 
    with open('./COW_Entities_types_in_time.csv', 'w', encoding='utf8') as o:
        fieldnames = ['COW_type'] + list(range(minYear, maxYear+1))
        output = csv.DictWriter(o, fieldnames=fieldnames)
        output.writeheader()
        for ctype, years in sorted(COW_types_by_year.items(), key=lambda o : translate_link_type[o[0]]['priority']):
            line = { 'COW_type': ctype}
            for y in range(minYear, maxYear+1):
                line[y] = years[y] if y in years else 0
            output.writerow(line) 

    # test RICentities Political_entities_in_time crossings
    with open('../../../data/RICentities.csv', 'r',encoding='utf8') as o:
        RICentities = csv.DictReader(o)
        COW_codes_in_RIC = set([r['COW_code'] for r in RICentities if r['COW_code'] != ''])
        COW_codes_in_PE = COW_entities.keys()
        new_RIC_from_PE = []
        for cow_code in COW_codes_in_PE - COW_codes_in_RIC:
            new_RIC_from_PE.append({
                "RICname": COW_entities[cow_code]['name'],
                "type": "country",
                "continent" : "",
                "COW_code": cow_code,
                "wikidata": ""
            })
        with open('new_RIC_from_Political_entities.csv', 'w', encoding= 'utf8') as f:
            output = csv.DictWriter(f, fieldnames= new_RIC_from_PE[0].keys())
            output.writeheader()
            output.writerows(new_RIC_from_PE)