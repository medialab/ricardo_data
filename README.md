# RICardo dataset

The RICardo dataset compiles trade statistics sources (primary, secondary and recent estimations) of international trade bilateral flows of the 19th century.

To know more or to cite this dataset please refer to : 
ADD HISTORICAL PAPER HERE

## /data

Data are provided in csv format (utf-8, comma separated) in a series of files which are described in the datapackage.json.

## /database_scripts

Some python and bash scripts used to:
- [**RICardo_sqlite_creation.py**](./db_script/RICardo_sqlite_creation.py): compile data csv files in a sqlite database (see [**RICardo_schema.sql**](./db_script/RICardo_schema.sql))
- [**RICardo_website_sqlite_creation.py**](./db_script/RICardo_sqlite_creation.py): prepare and filter csv files data and combine them into a sqlite database ready to serve the [**RICardo online exploration tool**](http://ricardo.medialab.sciences-po.fr). This scripts also create the few csv exports including in the tool.
- [**deploy_data.sh**](./db_script/deploy.sh): copy RICardo data in the RICardo web application folder pointed in the [**config.py**](./db_script/config.py) configuration file.
- [**update_csv_from_sqlite.py**](./db_script/update_csv_from_sqlite.py): update the data folder from the RICardo sqlite database. This script is used to update the data folder after having edited data in batch through sql queries. Some examples of such scripts can be found in the [*update_data_scripts*](./update_data_scripts) folder.
- [**test folder**](./db_script/test): a series of python scripts which applies some automatic tests to the RICardo_viz.sqlite database. It outputs various data quality reports in the *out_data* folder
 
## /update_data_scripts

This folder is used to document the data update sessions made:  original files, data update sql queries, notes...
Note that not all modifications were listed in this folder. To keep track of exhaustive changes made to data, use the historic feature of git.