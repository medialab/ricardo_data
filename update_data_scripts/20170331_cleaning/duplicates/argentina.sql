# unit problem in Argentina
UPDATE  flows SET unit = 1
WHERE reporting = "argentina" 
and year >= 1910 AND year <=1938 
and world_trade_type = "total_reporting1"

# valor oficial in Argentina
DELETE FROM flows 
WHERE reporting = "argentina" and year >= 1880 AND year <=1882  AND world_trade_type = "total_reporting1" AND notes = "Valor oficial"