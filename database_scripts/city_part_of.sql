.open ../sqlite_data/RICardo_viz.sqlite
.echo on
DROP TABLE IF EXISTS  flow_aggregated;
CREATE Table flow_aggregated AS 
	SELECT 
		*, 
		'source_'||type as quality_tag
	FROM flow_joined;

SELECT count(*) FROM flow_joined WHERE partner_type = 'city/part_of';
SELECT count(*) FROM flow_joined WHERE reporting_type = 'city/part_of';

-- count then REMOVE intra part_of_country flows
SELECT count(*)
FROM flow_joined 
WHERE partner_type = 'city/part_of' AND partner_part_of_country is not null AND reporting_part_of_country = partner_part_of_country;


DELETE FROM flow_aggregated WHERE partner_type = 'city/part_of' AND partner_part_of_country is not null AND reporting_part_of_country = partner_part_of_country;

-- save a list of flow aggregation creation process
.echo off
.mode csv
.headers on
.once './out_data/partner_city_part_off_agg.csv'
SELECT year, reporting, partner_part_of_country as partner, sum(flow*ifnull(unit, 1)/rate) as flow, expimp, count(*) as nb, group_concat(distinct partner)
FROM flow_aggregated 
WHERE partner_type = 'city/part_of' and partner_part_of_country is not null
GROUP BY reporting, year, partner_part_of_country, expimp 
ORDER BY nb DESC;

.headers off
.echo on
-- count new aggregated partners
SELECT count(*) FROM (SELECT year, reporting, partner_part_of_country as partner, sum(flow*ifnull(unit, 1)/rate) as flow, expimp, count(*) as nb, group_concat(distinct partner)
FROM flow_aggregated 
WHERE partner_type = 'city/part_of' and partner_part_of_country is not null
GROUP BY reporting, year, partner_part_of_country, expimp);


-- create
INSERT INTO flow_aggregated (year, reporting, reporting_type, reporting_continent, partner, partner_type, partner_continent, flow, unit, rate, expimp, quality_tag, type, notes )
SELECT year, reporting, reporting_type, reporting_continent, partner_part_of_country as partner, pp.type as partner_type, pp.continent as partner_continent, 
sum(flow*ifnull(unit, 1)/rate) as flow, 1 as unit, 1 as rate, expimp, "city_part_of_partner_aggregation" as quality_tag, 'aggregation', count(*) as notes
FROM flow_aggregated LEFT JOIN RICentities as pp ON partner_part_of_country = RICname 
WHERE partner_type = 'city/part_of' and partner_part_of_country is not null
GROUP BY reporting, year, partner_part_of_country, expimp;

SELECT count(*) FROM flow_aggregated WHERE type = 'aggregation';


DELETE from flow_aggregated where partner_type = 'city/part_of';
SELECT count(*) FROM flow_aggregated WHERE type = 'aggregation';


-- save a list of flow aggregation creation process
.echo off
.mode csv
.headers on
.once './out_data/reporting_city_part_off_agg.csv'
SELECT reporting_part_of_country as reporting, year, expimp, partner, sum(flow*ifnull(unit, 1)/rate) as flow,  count(*), group_concat(distinct reporting) as part_ofs
FROM flow_aggregated
WHERE reporting_type = 'city/part_of' and reporting_part_of_country is not null
GROUP BY reporting_part_of_country, year, expimp, partner
ORDER BY count(*) DESC;
--
.echo on
-- count new aggregated reportings
SELECT count(*) from (SELECT reporting_part_of_country as reporting, year, expimp, partner, sum(flow*ifnull(unit, 1)/rate) as flow,  count(*), group_concat(distinct reporting) as part_ofs
FROM flow_aggregated
WHERE reporting_type = 'city/part_of' and reporting_part_of_country is not null
GROUP BY reporting_part_of_country, year, expimp, partner
ORDER BY count(*) DESC);


--create
INSERT INTO flow_aggregated (year, reporting, reporting_type, reporting_continent, partner, partner_type, partner_continent, flow, unit, rate, expimp, quality_tag, type, notes )
SELECT year, reporting_part_of_country, pp.type, pp.continent, partner, partner_type, partner_continent, 
sum(flow*ifnull(unit, 1)/rate) as flow, 1 as unit, 1 as rate, expimp, "city_part_of_reporting_aggregation" as quality_tag, 'aggregation', count(*) as notes
FROM flow_aggregated LEFT JOIN RICentities as pp ON reporting_part_of_country = RICname 
WHERE reporting_type = 'city/part_of' and reporting_part_of_country is not null
GROUP BY reporting_part_of_country, year, partner, expimp;

SELECT count(*) FROM flow_aggregated WHERE type = 'aggregation';


-- 
DELETE from flow_aggregated where reporting_type = 'city/part_of' and type != 'aggregation';
SELECT count(*) FROM flow_aggregated WHERE type = 'aggregation';
-- 
