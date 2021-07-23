	--sources
CREATE TABLE `sources`
(
	`slug`			TEXT  PRIMARY KEY,
	`author`        TEXT,
	`name`			TEXT,
	`editor`		TEXT,
	`country`		TEXT,
	`volume_number`	TEXT,
	`volume_date`   TEXT,
	`edition_date`  TEXT,
	`pages`			TEXT,
	`shelf_number`	TEXT,
	`notes`			TEXT,
	'source_category' TEXT,
	'URL' 			TEXT,
	'type' 			TEXT
);

CREATE TABLE `exchange_rates`
(
	`year`					INTEGER,
	`modified_currency`		TEXT,
	`rate_to_pounds`		REAL,
	`source`			 	TEXT,
	`notes`					TEXT,
	PRIMARY KEY (`year`,`modified_currency`),
	FOREIGN KEY (source) 	REFERENCES sources(slug)
);
	-- PRIMARY KEY (`year`, `modified_currency`),

--currencies
CREATE TABLE `currencies`
(
	`currency`							TEXT,
	`year`								INTEGER,
	`reporting`							TEXT,
	`modified_currency`					TEXT,
	PRIMARY KEY (`currency`, `year`, `reporting`)
	FOREIGN KEY (year,modified_currency) 	REFERENCES exchange_rates(year,modified_currency)
);
	-- FOREIGN KEY (year)					REFERENCES exchange_rates(year),
	-- FOREIGN KEY (modified_currency)		REFERENCES exchange_rates(modified_currency)

CREATE TABLE `expimp_spegen`
(
	`export_import`				TEXT,
	`special_general`			TEXT,
	`modified_export_import`	TEXT,
	`modified_special_general`	TEXT,
	PRIMARY KEY (`export_import`, `special_general`)
);


CREATE TABLE `RICentities`
(
	`RICname`			TEXT PRIMARY KEY,
	`type`				TEXT,
	`continent`			TEXT,
	`GPH_code` 			TEXT,
	`slug`				TEXT,
	`part_of_country`	TEXT,
	`wikidata`			TEXT,
	'lat'				FLOAT,
	'lng'				FLOAT,
	FOREIGN KEY (part_of_country) 	REFERENCES RICentities(RICname)
);

--territorial entities
CREATE TABLE `entity_names`
(
	`original_name`			TEXT PRIMARY KEY,
	`french_name`			TEXT,
	`RICname`				TEXT,
	FOREIGN KEY (RICname) 	REFERENCES RICentities(RICname)
);

CREATE TABLE `RICentities_groups`
(
	`id`						INTEGER PRIMARY KEY AUTOINCREMENT,
	`RICname_group`				TEXT,
	`RICname_part`				TEXT,
	FOREIGN KEY (RICname_part) 	REFERENCES RICentities(RICname),
	FOREIGN KEY (RICname_group) REFERENCES RICentities(RICname)
);

CREATE TABLE `RICentities_links`
(
	`COW_code`				TEXT,
	`COW_name`				TEXT,
	`start_year`			INTEGER,
	`end_year`				INTEGER,
	`link_type`				TEXT,
	`sovereign_COW_name`	TEXT,
	`sovereign_COW_code`	TEXT,
	PRIMARY KEY (`COW_code`, `start_year`, `end_year`,`link_type`,`sovereign_COW_code`)
);


--flows data
CREATE TABLE `flows`
(
	`id`							INTEGER  PRIMARY KEY AUTOINCREMENT,
	`source`		 				TEXT,
	`flow`							REAL,
	`unit`							INTEGER,
	`currency`						TEXT,
	`year`							INTEGER,
	`reporting`						TEXT,
	`partner`						TEXT,
	`export_import`					TEXT,
	`special_general`				TEXT,
	`species_bullions`				TEXT,
	`transport_type`				TEXT,
	`statistical_period`			TEXT,
	`partner_sum`					TEXT,
	`world_trade_type`				TEXT,
	`notes`							TEXT,
	FOREIGN KEY (source) 			REFERENCES sources(slug),
	FOREIGN KEY (currency,year,reporting) 			REFERENCES currencies(currency,year,reporting),
	FOREIGN KEY (partner) 			REFERENCES entity_names(original_name),
	FOREIGN KEY (reporting) 		REFERENCES entity_names(original_name),
	FOREIGN KEY (export_import,special_general)		REFERENCES expimp_spegen(export_import,special_general)
);
