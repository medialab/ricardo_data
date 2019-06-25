export const MAXIMUM_FILE_SIZE = 10000000;
export const DEFAULT_CHUNK_SIZE = 100;

export const nonChangableFields = ['slug', 'export_import', 'special_general', 'reporting', 'partner', 'original_name', 'currency', 'year']

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