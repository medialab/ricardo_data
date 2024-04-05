# Trade flows des-aggregation methods

## Trade flows with groups

```bash
python python desaggregate_groups_blur_ratio_method.py 
python python group_desaggregations_new_method_to_sql.py 
```

TODO: explain the method

Note: There is an alternative method which looks at bilateral flows only the same here.


## Trade flows with `cities\part of`

```bash
cat groups_cities_to_countries/city_part_of.sql | sqlite3
```