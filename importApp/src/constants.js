import {capitalize, deburr} from 'lodash';

export const MAXIMUM_FILE_SIZE = 10000000;
export const DEFAULT_CHUNK_SIZE = 100;
export const DEFAULT_REF_BRANCH = 'master';

export const RANKED_FIELDS = {
  "id": 0,
  'flow': 1,
  "unit": 2,
  "year": 3,
  "species_bullions": 4,
  "transport_type": 5,
  "statistical_period": 6,
  "partner_sum": 7,
  "world_trade_type": 8,
  "notes": 9,
  "source": 10,
  "reporting": 11,
  "partner": 12,
  "export_import|special_general": 13,
  "currency|year|reporting": 14
}

export const LABEL_FIELDS_FK_SOLVED = {
  'partner': 'RICname',
  'reporting': 'RICname',
  'currency': 'modified_currency',
  'export_import': 'modified_export_import',
  'special_general': 'modified_special_general'
}
export const NON_CHANGABLE_FIELDS = ['slug', 'export_import', 'special_general', 'reporting', 'partner', 'original_name', 'currency', 'year']

export const SOURCE_SLUG_FIELDS = source => [ source.source_category === 'website' ? 'editor' : 'author','name', 'country', 'volume_date', 'volume_number', 'pages'];

const re = /[^a-zA-Z0-9]+/g;
const  source_generic_slugify = (source, fields) => fields.map(f => {
  if (source[f]){
    return source[f].trim().split(' ').map(w => capitalize(w.replace(re, ''))).join('')
  }
  else
    return null;
  
}, '').filter(e => e).join('_');

export const SOURCE_SLUGIFY = source => source_generic_slugify(source, SOURCE_SLUG_FIELDS(source))

export const SOURCE_SLUG_FILENAME = source => deburr(source_generic_slugify(source,
  [ source.source_category === 'website' ? 'editor' : 'author','name', 'country', 'volume_date', 'volume_number', 'pages']));

export const SOURCE_SUGGESTION_FIELDS = ['name', 'editor', 'country', 'volumn_number', 'shelf_number']