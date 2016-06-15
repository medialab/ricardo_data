UPDATE flows SET source="HT_62_1963_352-353" 
WHERE 
lower(reporting) IN (SELECT lower(original_name) FROM entity_names WHERE RICname="Finland")
AND lower(partner) IN (SELECT lower(original_name) FROM entity_names WHERE RICname="Russia/USSR")
AND year>=1840 and year <=1880;

UPDATE flows SET source="FT-FIN"
WHERE
lower(reporting) IN (SELECT lower(original_name) FROM entity_names WHERE RICname="Finland")
AND lower(partner) NOT IN (SELECT lower(original_name) FROM entity_names WHERE RICname="Russia/USSR")
AND year>=1840 and year <=1880;

UPDATE flows SET source="TULLI"
WHERE
lower(reporting) IN (SELECT lower(original_name) FROM entity_names WHERE RICname="Finland")
AND year >1880;


