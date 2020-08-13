# NOT WORKING TO BE CONTINUED...

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