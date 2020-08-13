import json
import os
import sqlite3
import itertools
from collections import defaultdict

# configuration
MAX_YEAR_DIFF = 10






def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d



flow_in_pounds = lambda flow: flow['flow']*flow['unit']/flow['rate'] 

def group_flows_by_yearexpimp(flows, method):
    grouped_flows = {
        'Exp':defaultdict(list),
        'Imp': defaultdict(list)
    }
    for flow in flows :
        year = flow['year']
        if method == 'direct':
            impexp = flow['expimp']
        else:
            impexp = 'Exp' if flow['expimp'] == 'Imp' else 'Imp'
        # group flows
        grouped_flows[impexp][year].append(flow)
    return grouped_flows

def filter_partial_partners_grouped_flows(grouped_flows, partners, method ):
    def filter_groups(groups):
        new_groups = {}
        for y,flows in groups.iteritems():
            entity_key = 'partner' if method == 'direct' else 'reporting'
            try :
                total = sum(float(f['unit'])*float(f['flow']) for f in flows)           
                if total and set(partners) == set(f[entity_key] for f in flows):
                    #calculate ratio
                    ratios = [{'partner':f[entity_key],
                               'ratio':f['unit']*f['flow']/total,
                               'partner_type':f['%s_type'%entity_key],
                               'partner_slug':f['%s_slug'%entity_key],
                               'partner_continent':f['%s_continent'%entity_key],
                               'partner_part_of_country':f['%s_part_of_country'%entity_key],
                               } for f in flows]
                    new_groups[y]={
                        'ratios':ratios,
                        'ratio_flows':flows,
                        'method':method    
                        }
            except Exception as e :
                print e
        return new_groups

    return {
        'Exp': filter_groups(grouped_flows['Exp']),
        'Imp': filter_groups(grouped_flows['Imp'])
        }


def process_nearest_ratio(group_flows, ratio_flows):
    total_flows = 0
    total_flows_with_ratio = 0
    desaggregated_group_flows = []
    remaining_group_flows = []
    for flow in group_flows:
        total_flows+=1
        
        year = flow['year'] 
        expimp = flow['expimp']

        ratio = None
        for ratio_year, ratio_group in ratio_flows[expimp].iteritems():
            ndyear = abs(ratio_year-year) 
            # here we could check the stability in time of ratio among partners in reporting trade 
            if ndyear <= MAX_YEAR_DIFF and (ratio is None or ndyear < ratio['dyear']):
                ratio = ratio_group.copy()
                ratio['dyear']=ndyear
        if ratio != None :
            # we've got one !
            total_flows_with_ratio += 1
            ratio.update({
                'group_flow': flow
                })
            desaggregated_group_flows.append(ratio)
        else :
            # couldn't find one fall back to mirror flows
            remaining_group_flows.append(flow)
    return {
        'total_flows':total_flows,
        'total_flows_with_ratio': total_flows_with_ratio, 
        'desaggregated_group_flows':desaggregated_group_flows,
        'remaining_group_flows': remaining_group_flows
    }




try :
    conf=json.load(open("config.json","r"))
    database_filename=os.path.join('../sqlite_data',conf["sqlite_viz"])
except :
    print "couldn't load config.json database"
    exit(1)


conn = sqlite3.connect(database_filename)
conn.row_factory = dict_factory

conn.cursor().executescript("""
    DROP TABLE IF EXISTS  flow_aggregated;
    CREATE Table flow_aggregated AS 
        SELECT 
            *, 
            'source_'||type as quality_tag
        FROM flow_joined;
    CREATE UNIQUE INDEX 'idflowaggregated' ON flow_aggregated (id);
    CREATE INDEX 'reportingflowaggregated' ON flow_aggregated (reporting);

    CREATE INDEX 'partnerflowaggregated' ON flow_aggregated (partner);
    CREATE INDEX 'yearflowaggregated' ON flow_aggregated (year) """)

cursor = conn.cursor()
subcursor = conn.cursor()


# Do we have groups for which we have mirror flows 

cursor.execute("""
SELECT  *
FROM flow_aggregated 
WHERE partner_type = 'group' ORDER BY partner,reporting,year""");


desaggregated_group_flows= []

total_flows = 0
total_direct_methods = 0
total_mirror_methods = 0

for (group,reporting), group_flows in itertools.groupby(cursor, lambda e: (e['partner'],e['reporting'])):
    
    partners = set(group.split(' & '))

    #looking for mirror flows
    direct_cases = {}
    subcursor.execute('SELECT * FROM flow_aggregated WHERE reporting = ? and partner IN ("'+'","'.join(partners)+'") ORDER BY year',[reporting])
    # group flows by year and expimp
    direct_flows_groups = group_flows_by_yearexpimp(subcursor, 'direct')
    # remove expimp-years for which we don't have all partners
    direct_flows_complete = filter_partial_partners_grouped_flows(direct_flows_groups, partners, 'direct')
    # add direct ratios to group flows
    by_direct_method = process_nearest_ratio(group_flows, direct_flows_complete)
    
    desaggregated_group_flows+= by_direct_method['desaggregated_group_flows']

    by_mirror_method = None
    if len(by_direct_method['remaining_group_flows']) > 0:
        #looking for mirror flows
        subcursor.execute('SELECT * FROM flow_aggregated WHERE reporting IN ("'+'","'.join(partners)+'") AND partner = ? ORDER BY year',[reporting])
          # group flows by year and expimp
        mirror_flows_groups = group_flows_by_yearexpimp(subcursor, 'mirror')
        # remove expimp-years for which we don't have all partners
        mirror_flows_complete = filter_partial_partners_grouped_flows(mirror_flows_groups, partners,  'mirror')
        # add direct ratios to group flows
        by_mirror_method = process_nearest_ratio(by_direct_method['remaining_group_flows'], mirror_flows_complete)
        desaggregated_group_flows += by_mirror_method['desaggregated_group_flows']
        mirror_flows_groups = by_mirror_method['total_flows_with_ratio']

    # print "direct %.2f pc mirror %s for '%s' - '%s'"%(
    #     100*float(by_direct_method['total_flows_with_ratio'])/by_direct_method['total_flows'],
    #     "%.2f"%(100*float(by_mirror_method['total_flows_with_ratio'])/by_mirror_method['total_flows']) if by_mirror_method else '-',
    #     group,
    #     reporting)
    total_flows += by_direct_method['total_flows']
    total_direct_methods += by_direct_method['total_flows_with_ratio']
    if by_mirror_method:
        total_mirror_methods += by_mirror_method['total_flows_with_ratio']

print "%s flows with group %s %.2f pc desaggregated by direct method, %s %.2f pc desaggregated by mirror method"%(
    total_flows, total_direct_methods, 100*float(total_direct_methods)/total_flows, total_mirror_methods, 100*float(total_mirror_methods)/total_flows)


# process sql inserts




with open('group_desaggregations_new_method.json','w') as f:
    json.dump(desaggregated_group_flows, f, encoding='utf8', indent=2)

