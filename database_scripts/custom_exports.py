import json
import sqlite3
import csvkit
import os

########## UTILS

def reduce_years_list_into_periods(_years):
  years = [int(y) for y in _years]
  years.sort()
  periods=[]
  for y in years:
    if len(periods)>0 and y == periods[-1][1] + 1:
      periods[-1][1]+=1
    elif len(periods) == 0 or y > periods[-1][1]:
      if len(periods) != 0  and periods[-1][0] == periods[-1][1]:
        del periods[-1][1]
      periods.append([y,y])  
  return periods

def formatRef(ref):
  # MLA specification for archive material:
  # Author (last name, first name).
  # Title/description of material.
  # Date (day month year).
  # Call number, identifier or box/folder/item number.
  # Collection name.
  # Name of repository, location.

  # RICardo version
  # author.
  # name, country, vol_number, vol_date.
  # editor, edition_date.
  # pages, shelf_number, URL.
  source = list(ref)
  bibliographicRef= ''
  if source[0]:
    bibliographicRef += source[0]+'.'
  # name, country, vol_number, vol_date.
  title = ', '.join([s for s in source[1:5] if s])+'.'
  if title != '.':
    bibliographicRef += ' '+title if bibliographicRef != '' else title
  # editor, edition_date.
  editions = ', '.join([s for s in source[5:7] if s])+'.'
  if editions != '.':
    bibliographicRef += ' '+editions if bibliographicRef != '' else editions
  # pages, shelf_number, URL.
  if source[7]:
    source[7]= 'pp. '+source[7]
  identifiers = ', '.join([s for s in source[7:10] if s])+'.'
  if identifiers != '.':
    bibliographicRef += ' '+identifiers if bibliographicRef != '' else identifiers

  return [bibliographicRef] + source

# export a list of RICentities with some stats
def export_RICentities_csv(cursor, output_filename):

  cursor.row_factory = sqlite3.Row

  select_RICentities = """
  SELECT * from RICentities
  """
  cursor.execute(select_RICentities)
  RICentities = {}
  for ric in cursor:
    RICentities[ric[0]]={'RICname':ric[0], 'RICtype': ric[1], 'continent': ric[2], 'COW code': ric[3]}

  select_reportings ="""
  SELECT reporting,
  GROUP_CONCAT(original_reporting,'|') as original_names, 
  GROUP_CONCAT(source_label,'|') as sources, GROUP_CONCAT(distinct year), count(*) as nb_flows
  FROM flow_joined 
  WHERE partner NOT LIKE 'World%'
  GROUP BY reporting"""

  for reporting in cursor.execute(select_reportings):
    RICentities[reporting[0]]['names in source (reporting)'] = "; ".join(set(reporting[1].split('|')))
    RICentities[reporting[0]]['sources (reporting)'] = "; ".join(set(reporting[2].split('|')))
    RICentities[reporting[0]]['bilateral periods (reporting)'] = ','.join('-'.join(str(e) for e in p) for p in reduce_years_list_into_periods(reporting[3].split(',')))
    RICentities[reporting[0]]['nb flows (reporting)'] = reporting[4]
    RICentities[reporting[0]]['total nb flows'] = reporting[4]
    
  select_partners="""
  SELECT partner, 
  GROUP_CONCAT(original_partner,'|') as original_names, 
  GROUP_CONCAT(source_label,'|') as sources, GROUP_CONCAT(distinct year), count(*) as nb_flows
  FROM flow_joined
  WHERE partner NOT LIKE 'World%'
  GROUP BY partner"""

  for partner in cursor.execute(select_partners):
    RICentities[partner[0]]['names in source (partner)'] = "; ".join(set(partner[1].split('|')))
    RICentities[partner[0]]['sources (partner)'] = "; ".join(set(partner[2].split('|')))
    RICentities[partner[0]]['bilateral periods (partner)'] = ','.join('-'.join(str(e) for e in p) for p in reduce_years_list_into_periods(partner[3].split(',')))
    RICentities[partner[0]]['nb flows (partner)'] = partner[4]
    if 'total nb flows' in RICentities[partner[0]]:
      RICentities[partner[0]]['total nb flows'] += partner[4]
    else:
      RICentities[partner[0]]['total nb flows'] = partner[4]

  with open(output_filename, "w") as f :
    hs = ['RICname', 'RICtype', 'continent', 'COW code', 'total nb flows',
    'nb flows (reporting)', 'nb flows (partner)',
    'names in source (reporting)', 'names in source (partner)',
    'bilateral periods (reporting)', 'bilateral periods (partner)',
    'sources (reporting)', 'sources (partner)'] 
    dw = csvkit.DictWriter(f, fieldnames= hs )
    dw.writeheader()
    dw.writerows(sorted((r for r in RICentities.values() if 'total nb flows' in r),key =lambda r:-1*r['total nb flows']))
    return 0
  return 1

################# SOURCES
# exports list of source with bibliographic reference
def export_sources_csv(cursor,output_filename):
  cursor.row_factory = sqlite3.Row
  sql="""
  SELECT author,name,country,volume_number,volume_date,editor,edition_date,pages,shelf_number,URL,source_category,type,notes
  FROM sources as s 
  WHERE s.slug in (SELECT distinct source from flow_joined) OR 
        s.slug in (SELECT distinct source from exchange_rates)"""
  rows = cursor.execute(sql)
  first = rows.next()
  with open(output_filename,'w') as f:
    dw = csvkit.writer(f)
    dw.writerow(["bibliographic reference"] + first.keys())
    dw.writerow(formatRef(first))
    dw.writerows(formatRef(r) for r in rows)  
    return 0
  return 1

# export a list of RICentities with some stats
def export_RICentities_FT_comparision(cursor, output_filename, table='flow_joined'):

  cursor.row_factory = sqlite3.Row

  select_RICentities = """
    SELECT RICname, type, continent, COW_code, sum(COALESCE(report.nb_flows,0)) as nb_flows_as_reporting, sum(COALESCE(partner.nb_flows,0)) as nb_flows_as_partner 
  FROM RICentities
    LEFT JOIN (SELECT count(id) as nb_flows, reporting FROM %(table)s where partner not like 'world%%' group by reporting) as report on report.reporting = RICname
    LEFT JOIN (SELECT count(id) as nb_flows, partner FROM %(table)s group by partner) as partner on partner.partner = RICname
  WHERE RICname not LIKe 'World%%'
  group by RICname HAVING nb_flows_as_reporting != 0 OR nb_flows_as_partner != 0
  ORDER BY nb_flows_as_reporting DESC, nb_flows_as_partner DESC 
  """%{'table': table}
  cursor.execute(select_RICentities)
  RICentities = {}
  for ric in cursor:
    RICentities[ric[0]]=dict(ric)
  
  # FT reportings
  select_FT_RICentities_number = """
    SELECT year, count(distinct reporting) as nb_flows_FT
    FROM %s 
    WHERE partner = 'World Federico Tena'
    GROUP BY year
    ORDER BY year
  """%table
  ft_reportings_by_year = dict( (str(y),n) for (y,n) in cursor.execute(select_FT_RICentities_number))

  select_reportings ="""
 SELECT reporting, year, ft.FT, count(id) as nb_flows
 FROM %s LEFT JOIN (
    SELECT reporting, year, 1 as FT
    FROM %s 
    WHERE partner = 'World Federico Tena' 
    GROUP BY reporting, year ) as ft
    USING (reporting, year)
 WHERE partner NOT LIKE 'World%%'
  GROUP BY reporting, year;"""%(table, table)

  for (reporting, year, ft, nb_flows) in cursor.execute(select_reportings):
    if reporting not in RICentities:
      print 'undocumented RIC %s'%reporting
      RICentities[reporting]={'RICname':reporting, 'nb_flows_as_reporting': nb_flows, 'nb_flows_as_partner': 0}
    # y'a un problème avec nb_flows_as_reporting
    RICentities[reporting][str(year)] = "ft_reporting" if ft else "reporting"
    
  select_partners="""
  SELECT f.partner, f.year, ft.FT, count(id) as nb_flows
 FROM %s as f LEFT JOIN (
    SELECT reporting, year, 1 as FT
    FROM %s 
    WHERE partner = 'World Federico Tena' 
    GROUP BY reporting, year ) as ft
    ON f.partner=ft.reporting AND f.year = ft.year
 WHERE f.partner NOT LIKE 'World%%'
  GROUP BY f.partner, f.year;"""%(table, table)



  for (partner, year, ft, nb_flows) in cursor.execute(select_partners):
    if partner not in RICentities:
      print 'undocumented RIC %s'%partner
      RICentities[partner]={'RICname': partner, 'nb_flows_as_reporting': 0, 'nb_flows_as_partner': nb_flows}
    if str(year) not in RICentities[partner]:
      RICentities[partner][str(year)] = "ft_partner_only" if ft else "partner_only"
      # y'a un bug là !!
      RICentities[partner]['nb_flows_as_partner'] = nb_flows


  cursor.execute('SELECT min(year) as min_year, max(year) as max_year from %s'%table)
  (min_year, max_year) = cursor.next()
  years = [str(y) for y in range(min_year, max_year+1)]
  
  nb_entities_in_ft_and_ricardo = dict((y,0) for y in years)
  nb_entities_in_ricardo_not_in_ft = dict((y,0) for y in years)
  
  for r in RICentities.values():
    for y in years:
      if y in r and 'ft' in r[y]:
        nb_entities_in_ft_and_ricardo[y] += 1
      elif y in r:
        nb_entities_in_ricardo_not_in_ft[y] += 1

  
  with open(output_filename, "w") as f :
    hs = ['RICname', 'type', 'continent', 'COW_code', 'nb_flows_as_reporting', 'nb_flows_as_partner'] + [y for y in years] 
    dw = csvkit.DictWriter(f, fieldnames= hs )
    ft_reportings_by_year['nb_flows_as_partner'] = 'nb FT reportings'
    nb_entities_in_ft_and_ricardo['nb_flows_as_partner']= 'nb in FT & RIC'
    nb_entities_in_ricardo_not_in_ft['nb_flows_as_partner']= 'nb in RIC not in FT'
    dw.writeheader()
    dw.writerow(ft_reportings_by_year)
    dw.writerow(nb_entities_in_ft_and_ricardo)
    dw.writerow(nb_entities_in_ricardo_not_in_ft)
    dw.writerows(sorted((r for r in RICentities.values()),key =lambda r:-1*(r['nb_flows_as_reporting']+r['nb_flows_as_partner'])))
    return 0
  return 1

if __name__ == '__main__':
  with open('./config.json', 'r') as c:
    config = json.load(c)
    conn = sqlite3.connect('../sqlite_data/%s'%config['sqlite_viz'])
    cursor = conn.cursor()
    export_RICentities_FT_comparision(cursor, 'out_data/RICentities_FT_flow_joined.csv')
    export_RICentities_FT_comparision(cursor, 'out_data/RICentities_FT_flow_aggregated.csv', 'flow_aggregated')


