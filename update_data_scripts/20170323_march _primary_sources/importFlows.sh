# reset the database
rm ../../sqlite_data/RICardo.sqlite
sqlite3 ../../sqlite_data/RICardo.sqlite < ../../db_script/RICardo_schema.sql
csvsql --db sqlite:///../../sqlite_data/RICardo.sqlite --insert --no-create ../../csv_data/*.csv
# import data
for i in *.csv;
 do
  echo $i
  csvcut -c 1:15 "$i" | csvsql --db sqlite:///../../sqlite_data/RICardo.sqlite --tables flows --insert --no-create
done