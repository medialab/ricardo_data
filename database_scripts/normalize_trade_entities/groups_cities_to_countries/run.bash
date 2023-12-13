#!/bin/bash
# calculate groups desaggregations by ratio method
python desaggregate_groups_blur_ratio_method.py
# apply the results to the sql database
python group_desaggregations_new_method_to_sql.py
# aggregate cities
cat city_part_of.sql | sqlite3