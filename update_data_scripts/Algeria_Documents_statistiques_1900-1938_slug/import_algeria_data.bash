# reset the database
rm ../sqlite_data/RICardo.sqlite
sqlite3 ../sqlite_data/RICardo.sqlite ".read ../db_script/RICardo_schema.sql"
csvsql --db sqlite:///../sqlite_data/RICardo.sqlite --insert --no-create ../csv_data/*.csv
# import data for Algérie
csvsql --db sqlite:///../sqlite_data/RICardo.sqlite --tables sources --insert --no-create sources_metadata.csv
csvsql --db sqlite:///../sqlite_data/RICardo.sqlite --tables flows --insert --no-create flows.csv
