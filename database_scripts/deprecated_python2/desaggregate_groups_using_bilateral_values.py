import json
import os
import sqlite3
import itertools

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


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

group_flows = conn.cursor()
mirror_flow = conn.cursor()


# Do we have groups for which we have mirror flows 

group_flows.execute("""
SELECT  *
FROM flow_aggregated 
WHERE partner_type = 'group' ORDER BY partner,reporting,year""");

group_desaggregations = []
nb_flows_with_groups = 0
nb_flows_with_groups_desagg = 0
complete_desagg_ratio_tot = 0
complete_desagg_tot = 0
group_modif_tot = 0


flow_in_pounds = lambda flow: flow['flow']*flow['unit']/flow['rate'] 


for (group,reporting), flows in itertools.groupby(group_flows, lambda e: (e['partner'],e['reporting'])):
    flows = list(flows)

    nb_flows_with_groups+=len(flows)
    year_expimp = dict((year,dict((f['expimp'],f) for f in yf)) for year,yf in itertools.groupby(flows, lambda e: e['year']))
    #print "%s '%s' %s %s %s"%(len(flows),group,reporting, min(year_expimp.keys()), max(year_expimp.keys()))
    partners = set(group.split(' & '))

    #looking for mirror flows
    mirror_cases = {}
    mirror_flow.execute('SELECT * FROM flow_aggregated WHERE reporting IN ("'+'","'.join(partners)+'") AND partner = ? AND year >= ? AND year<= ? ORDER BY year',
        (reporting,min(year_expimp.keys()), max(year_expimp.keys())))
    for mirror in mirror_flow :
        year = mirror['year']
        impexp = 'Exp' if mirror['expimp'] == 'Imp' else 'Imp'
        if year in year_expimp and impexp in year_expimp[year]:
            key = "%s,%s"%(year,impexp)
            mirror_cases[key]= mirror_cases[key]+[mirror] if key in mirror_cases else [mirror]
            
    complete_desagg_ratio = 0
    complete_desagg = 0
    group_modif = 0
    for k, mirrors in  mirror_cases.iteritems():
        (year, expimp) = k.split(',')
        year = int(year)
        group_desaggregation = {
            'year': year,
            'expimp': expimp,
            'group_flow': year_expimp[year][expimp],
            'mirror_flows': mirrors,
            'new_flows' : [],
            'update' : {},                
            'delete_group_flow': False
        }


        coverage = set(m['reporting'] for m in mirrors) & partners
        if len(coverage)  == len(partners):
            # desagregate the group by applying a ratio
            # create new flows
            mirror_total = sum(flow_in_pounds(m) for m in mirrors)
            if mirror_total==0:
                print 'ERROR mirror_total 0 %s'%mirrors
            else: 
                for mirror in mirrors:
                    # one new flow by mirror flow by copying the original flow
                    group_desaggregation['new_flows'].append(year_expimp[year][expimp].copy())
                    # the partner is not the group but a precise partner
                    group_desaggregation['new_flows'][-1]['partner'] = mirror['reporting']
                    group_desaggregation['new_flows'][-1]['partner_type'] = mirror['reporting_type']
                    group_desaggregation['new_flows'][-1]['partner_continent'] = mirror['reporting_continent']
                    group_desaggregation['new_flows'][-1]['partner_part_of_country'] = mirror['reporting_continent']             
                    # the flow amount is calculated by applying on original value the ratio calculated from mirror flows composing the group
                    group_desaggregation['new_flows'][-1]['flow'] = year_expimp[year][expimp]['flow']*flow_in_pounds(mirror)/mirror_total
                    # adding a quality flag on this new generated flow
                    group_desaggregation['new_flows'][-1]['quality_tag'] = 'group_desaggregation_total_by_ratio'
                # we remove the original flow
                group_desaggregation['delete_group_flow'] = True
                complete_desagg_ratio += 1
        elif len(coverage) == len(partners)-1 :
            # we remove the amount of the mirror flows from the original flow
            new_flow = year_expimp[year][expimp]['flow'] - sum(flow_in_pounds(m) for m in mirrors)*year_expimp[year][expimp]['rate']/year_expimp[year][expimp]['unit']
            # remove the mirror partners from the group
            group_desaggregation['update']={
                'partner': ' & '.join(sorted(partners - coverage)), #should be only one
                # 'partner_type' : '',# /!\ to be added later
                'flow' : new_flow,
                'quality_tag' : 'group_desaggregation_total' if new_flow>=0 else "negative_group_desaggregation_total"
            }
            complete_desagg += 1
        else:
            # we remove the amount of the mirror flows from the original flow
            new_flow = year_expimp[year][expimp]['flow'] - sum(flow_in_pounds(m) for m in mirrors)*year_expimp[year][expimp]['rate']/year_expimp[year][expimp]['unit']
            # remove the mirror partners from the group
            group_desaggregation['update']={
                'partner': ' & '.join(sorted(partners - coverage)),
                'flow' : new_flow,
                'quality_tag' : 'group_desaggregation_partial' if new_flow>=0 else "negative_group_desaggregation_partial"
            }
            group_modif += 1
        group_desaggregations.append(group_desaggregation)
        nb_flows_with_groups_desagg+=1
    
    complete_desagg_ratio_tot += complete_desagg_ratio
    complete_desagg_tot += complete_desagg
    group_modif_tot += group_modif

    #if complete_desagg>0 or complete_desagg_ratio>0 or group_modif>0:
       # print "%s ratio %s desag %s group modif"%(complete_desagg_ratio,complete_desagg, group_modif)


print "%s flows desaggregated on %s %.2f"%(nb_flows_with_groups_desagg,nb_flows_with_groups,nb_flows_with_groups_desagg/nb_flows_with_groups)
print "with ratio:%s, desagg:%s, modified:%s"%(complete_desagg_ratio_tot,complete_desagg_tot,group_modif_tot)   


with open('group_desaggregations.json','w') as f:
    json.dump(group_desaggregations, f, encoding='utf8', indent=2)

