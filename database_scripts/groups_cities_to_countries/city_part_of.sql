.open ../../sqlite_data/RICardo_viz.sqlite
.echo on

SELECT count(*) FROM flow_joined WHERE partner_type = 'city/part_of';
SELECT count(*) FROM flow_joined WHERE reporting_type = 'city/part_of';
SELECT count(*) FROM flow_joined WHERE partner_type = 'city/part_of' AND reporting_type = 'city/part_of';


-- count then REMOVE intra part_of_GPH_entity flows
SELECT count(*)
FROM flow_joined 
WHERE partner_type = 'city/part_of' AND partner_part_of_GPH_entity is not null AND reporting_part_of_GPH_entity = partner_part_of_GPH_entity;


DELETE FROM flow_aggregated WHERE partner_type = 'city/part_of' AND partner_part_of_GPH_entity is not null AND reporting_part_of_GPH_entity = partner_part_of_GPH_entity;

-- save a list of flow aggregation creation process
.echo off
.mode csv
.headers on
.once './partner_city_part_of_agg.csv'
SELECT year, reporting, partner_part_of_GPH_entity as partner, sum(flow*ifnull(unit, 1)/rate) as flow, expimp, count(*) as nb, group_concat(distinct partner)
FROM flow_aggregated 
WHERE partner_type = 'city/part_of' and partner_part_of_GPH_entity is not null
GROUP BY reporting, year, partner_part_of_GPH_entity, expimp 
ORDER BY nb DESC;

.headers off
.echo on
-- count new aggregated partners flows
SELECT count(*) FROM (SELECT year, reporting, partner_part_of_GPH_entity as partner, sum(flow*ifnull(unit, 1)/rate) as flow, expimp, count(*) as nb, group_concat(distinct partner)
FROM flow_aggregated 
WHERE partner_type = 'city/part_of' and partner_part_of_GPH_entity is not null
GROUP BY reporting, year, partner_part_of_GPH_entity, expimp);


-- create
INSERT INTO flow_aggregated 
(year, reporting, reporting_type, reporting_continent, reporting_slug, reporting_GPH_code, partner, partner_type, partner_continent, partner_slug, partner_GPH_code, flow, unit, rate, expimp, quality_tag, type, notes )
SELECT year, reporting, reporting_type, reporting_continent, reporting_slug, reporting_GPH_code, partner_part_of_GPH_entity as partner, pp.type as partner_type, pp.continent as partner_continent, pp.slug as partner_slug, pp.GPH_code as partner_GPH_code,
sum(flow*ifnull(unit, 1)/rate) as flow, 1 as unit, 1 as rate, expimp, "city_part_of_partner_aggregation" as quality_tag, 'aggregation', count(*) as notes
FROM flow_aggregated LEFT JOIN RICentities as pp ON partner_part_of_GPH_entity = RICname 
WHERE partner_type = 'city/part_of' and partner_part_of_GPH_entity is not null
GROUP BY reporting, year, partner_part_of_GPH_entity, expimp;

-- count how many aggregated flows has been created
SELECT count(*) FROM flow_aggregated WHERE type = 'aggregation';

-- delete the city/partof flows
DELETE from flow_aggregated where partner_type = 'city/part_of';

-- check the number of aggregated flows
SELECT count(*) FROM flow_aggregated WHERE type = 'aggregation';


-- save a list of flow aggregation creation process
.echo off
.mode csv
.headers on
.once './reporting_city_part_of_agg.csv'
SELECT reporting_part_of_GPH_entity as reporting, year, expimp, partner, sum(flow*ifnull(unit, 1)/rate) as flow,  count(*), group_concat(distinct reporting) as part_ofs
FROM flow_aggregated
WHERE reporting_type = 'city/part_of' and reporting_part_of_GPH_entity is not null
GROUP BY reporting_part_of_GPH_entity, year, expimp, partner
ORDER BY count(*) DESC;
--
.echo on
-- count new aggregated reportings flows
SELECT count(*) from (SELECT reporting_part_of_GPH_entity as reporting, year, expimp, partner, sum(flow*ifnull(unit, 1)/rate) as flow,  count(*), group_concat(distinct reporting) as part_ofs
FROM flow_aggregated
WHERE reporting_type = 'city/part_of' and reporting_part_of_GPH_entity is not null
GROUP BY reporting_part_of_GPH_entity, year, expimp, partner
ORDER BY count(*) DESC);

--create
INSERT INTO flow_aggregated (year, reporting, reporting_type, reporting_continent, reporting_slug, partner, partner_type, partner_continent, partner_slug, flow, unit, rate, expimp, quality_tag, type, notes )
SELECT year, reporting_part_of_GPH_entity, pp.type, pp.continent, pp.slug, partner, partner_type, partner_continent, partner_slug,
sum(flow*ifnull(unit, 1)/rate) as flow, 1 as unit, 1 as rate, expimp, "city_part_of_reporting_aggregation" as quality_tag, 'aggregation', count(*) as notes
FROM flow_aggregated LEFT JOIN RICentities as pp ON reporting_part_of_GPH_entity = RICname 
WHERE reporting_type = 'city/part_of' and reporting_part_of_GPH_entity is not null
GROUP BY reporting_part_of_GPH_entity, year, partner, expimp;

SELECT count(*) FROM flow_aggregated WHERE type = 'aggregation';


-- 
DELETE from flow_aggregated where reporting_type = 'city/part_of' and type != 'aggregation';
SELECT count(*) FROM flow_aggregated WHERE type = 'aggregation';
--



-- 

SELECT count(*) FROM (
	SELECT 1
	FROM flow_aggregated
	WHERE partner not LIKE "%world%"
	GROUP BY reporting, year, partner, expimp HAVING count(*) > 1
);

SELECT count(*) FROM (SELECT 1
FROM flow_aggregated
WHERE partner not LIKE "%world%"
GROUP BY reporting, year, partner, expimp HAVING count(*) > 1 AND like('%aggregation%',group_concat(type))
);
