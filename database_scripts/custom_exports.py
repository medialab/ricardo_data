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
