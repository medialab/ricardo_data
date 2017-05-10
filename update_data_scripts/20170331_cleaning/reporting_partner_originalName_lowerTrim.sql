-- select group_concat(original_name),lower(trim(original_name)) as new_original from entity_names  group by new_original HAVING count(*)>1
-- Antillas Holandesas,Antillas holandesas	antillas holandesas
-- Congo Belga,Congo belga	congo belga
-- India Britannica,India britannica	india britannica
-- India Inglesa,India inglesa	india inglesa
-- Sarre,sarre	sarre
-- Tripolitaine et Cyrénaïque,tripolitaine et Cyrénaïque,tripolitaine et cyrénaïque	tripolitaine et cyrénaïque
-- Union économique Belgo-Luxembourgeoise,Union économique belgo-luxembourgeoise,union économique belgo-luxembourgeoise	union économique belgo-luxembourgeoise
DELETE FROM entity_names WHERE original_name IN ('Antillas holandesas','Congo belga','India britannica',
	'India inglesa','Sarre','tripolitaine et Cyrénaïque','tripolitaine et cyrénaïque',
	'Union économique Belgo-Luxembourgeoise','Union économique belgo-luxembourgeoise');


UPDATE flows SET reporting = lower(trim(reporting)) WHERE reporting <> lower(trim(reporting));
UPDATE flows SET partner = lower(trim(partner)) WHERE partner <> lower(trim(partner));
UPDATE currencies SET reporting = lower(trim(reporting)) WHERE reporting <> lower(trim(reporting));
UPDATE entity_names SET original_name = lower(trim(original_name)) WHERE original_name <> lower(trim(original_name));


UPDATE flows SET currency = lower(trim(currency)) WHERE currency <> lower(trim(currency));