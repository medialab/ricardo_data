

SELECT group_concat( distinct reporting), export_import, special_general
					  	from flows
					  	LEFT OUTER JOIN expimp_spegen as eisg USING (export_import, special_general)
					  	WHERE eisg.modified_export_import is null AND eisg.modified_special_general is null
			GROUP BY export_import, special_general


			INSERT INTO expimp_spegen (export_import, special_general, modified_export_import, modified_special_general) VALUES ('Imp',null, 'Imp', null);
INSERT INTO expimp_spegen (export_import, special_general, modified_export_import, modified_special_general) VALUES ('Imp','gen', 'Exp', 'Gen');
INSERT INTO expimp_spegen (export_import, special_general, modified_export_import, modified_special_general) VALUES ('Exp','spe', 'Exp', 'Spe');
INSERT INTO expimp_spegen (export_import, special_general, modified_export_import, modified_special_general) VALUES ('Exp',null, 'Exp', null);
INSERT INTO expimp_spegen (export_import, special_general, modified_export_import, modified_special_general) VALUES ('Exp','gen', 'Exp', 'Gen');


UPDATE flows SET year= substr(year,0,4) , statistical_period=year WHERE  year LIKE '%-%' AND reporting = 'Australia'




