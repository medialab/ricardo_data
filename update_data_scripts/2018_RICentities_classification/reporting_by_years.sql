.open ../../sqlite_data/RICardo_viz.sqlite
.mode csv
.headers on
.once './reporting_by_years.csv'
SELECT reporting,  year, count(*) as nb_flows, reporting_type, reporting_continent, sum(flow*unit/rate) as total_value FROM flow_joined 
WHERE partner NOT LIKE '%world%' group by reporting, year ORDER BY reporting ASC, year ;

.once './reporting_world_years.csv'
SELECT reporting, reporting_type, group_concat(distinct year) from flow_joined where partner LIKE '%World%' AND partner != 'World Federico Tena' group by reporting 
ORDER BY count(distinct year) ASC ;

.once './reporting_world_FT_years.csv'
SELECT reporting, reporting_type, group_concat(distinct year) from flow_joined where partner = 'World Federico Tena' group by reporting 
ORDER BY count(distinct year) ASC ;