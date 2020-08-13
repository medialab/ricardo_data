# The RICardo dataset

The RICardo dataset compiles trade statistics sources (primary, secondary and recent estimations) of international trade bilateral flows of the 19th century.

We created a [web application](http://ricardo.medialab.sciences-po.fr) to visually explore this dataset. This application is not only a [final product but a research tool](http://medialab.github.io/ricardo/) which helped us in curating this dataset by providing data quality feedbacks and support research works.

This dataset is meant to evolve. You can follow our work in [the RIcardo hypothèses.org blog](http://ricardo.hypotheses.org/).

## To learn more about this dataset 
Dedinger, Béatrice, et Paul Girard. 2017. « Exploring trade globalization in the long run: The RICardo project ». Historical Methods: A Journal of Quantitative and Interdisciplinary History 50 (1): 30‑48. doi:10.1080/01615440.2016.1220269.  
<a href="http://www.tandfonline.com/doi/citedby/10.1080/01615440.2016.1220269" target="_blank">the paper at Historical Methods</a>  
<a href="http://ricardo.medialab.sciences-po.fr/Dedinger_Girard_RICardo_HistoricalMethods_revised.pdf" target="_blank">our preprint version: 01-May-2016</a></p>

## get the data

To download the data you can : 

- use the published dataset by downloading the DOI below or in the release section;
- to get the last data version, clone this repository and use a database script to combine he data (see dedicated section)


## How to cite
![DOI/10.5281/zeonod.1119592](https://zenodo.org/badge/DOI/10.5281/zenodo.1119592.svg)  
Béatrice Dedinger, & Paul Girard. (2017). RICardo dataset 2017.12 (Version 2017.12) [Data set]. Zenodo. http://doi.org/10.5281/zenodo.1119592

## license

The RICardo dataset is made available under the Open Database License: [http://opendatacommons.org/licenses/odbl/1.0/](http://opendatacommons.org/licenses/odbl/1.0/). Any rights in individual contents of the database are licensed under the Database Contents License: [http://opendatacommons.org/licenses/dbcl/1.0/](http://opendatacommons.org/licenses/dbcl/1.0/)

# Compile the dataset

If you want to get the latest data version through our deduplication algorithm you can use our *database_scripts*.

First **prepare your python environment**:
```
$ pyenv virtualenv 3.8 ricardo_data
$ pyenv activate ricardo_data
$ pip install -r requirements.txt
```
Only the pip install is mandatory but using *pyenv* and *virtualenv* is more than recommended.

**Aggregate** the many data/flows/source(s).csv into one **data/flows.csv**
```
$ cd database_scripts
$ python flows.py aggregate
```

**deduplicate trade flows** (primary sources, general/special...)
```
$ python flows.py deduplicate
```
This script outputs a sqlite database and a flows_deduplicated.csv

# Repository structure

## ./data

Data are provided in csv format (utf-8, comma separated):
- **flows/**: the trade flows transcribed from sources, one CSV file by source. See ./Database_scripts to learn how to combine the flow data
- **sources.csv**: volumes of statistics, books or research papers used to compile the flows table 
- **RICentities.csv**: RICentites are the unified nomencalture of trade reporting and partner names
- **RICentities_group.csv**: Some RICentities are of type 'group'. This table show which entities are part of RICentities groups
- **entity_names.csv**: This table documents how the partner and reporting original names in sources have been translated in a unified nomemclature
- **exchange_rates.csv**: exchange rates used to convert trade flows to pound sterling
- **currencies.scv**: currencies translation table
- **expimp_spegen.csv**:export/import and special/general translation table

The precise format (list of type of fields) of those csv files is described in the [datapackage.json](./datapackage.json) file. Learn more about data packages on the [frictionless data website](https://frictionlessdata.io/guides/data-package/).

## ./database_scripts

This folder contains some python and bash scripts used to:
- [**deduplicate_flows.py**](./db_script/RICardo_sqlite_creation.py): prepare and filter flows data and combine them into a sqlite database ready to serve the [**RICardo online exploration tool**](http://ricardo.medialab.sciences-po.fr). This scripts also create the few csv exports including in the tool.
- [**deploy_data.sh**](./db_script/deploy.sh): copy RICardo data in the RICardo web application folder pointed in the [**config.py**](./db_script/config.py) configuration file.

*and more to be documented soon...*

### deprecated python2 script yet to be ported

- [**RICardo_sqlite_creation.py**](./db_script/RICardo_sqlite_creation.py): compile data csv files in a sqlite database (see [**RICardo_schema.sql**](./db_script/RICardo_schema.sql))
- [**update_csv_from_sqlite.py**](./db_script/update_csv_from_sqlite.py): update the data folder from the RICardo sqlite database. This script is used to update the data folder after having edited data in batch through sql queries. Some examples of such scripts can be found in the [*update_data_scripts*](./update_data_scripts) folder.
- [**test folder**](./db_script/test): a series of python scripts which applies some automatic tests to the RICardo_viz.sqlite database. It outputs various data quality reports in the *out_data* folder
 
## ./update_data_scripts

This folder is used to document the data update sessions made:  original files, data update sql queries, notes...
Note that not all modifications were listed in this folder. To keep track of exhaustive changes made to data, use the historic feature of git.

## supported by
This work has been supported by l’Agence National de la Recherche under the reference RICARDO ANR-06-BLAN-0332 and by Sciences Po Scientific Advisory Board.  
[![Sciences Po, médialab](http://ricardo.medialab.sciences-po.fr/svg/sciences-po-medialab.svg)](http://medialab.sciences-po.fr)&nbsp;&nbsp;&nbsp;&nbsp;
[![Sciences Po, Centre d'Histoire](http://ricardo.medialab.sciences-po.fr/svg/sciences-po-centre-histoire.svg)](http://chsp.sciences-po.fr/)&nbsp;&nbsp;&nbsp;&nbsp; 
[<img src="http://ricardo.medialab.sciences-po.fr/img/logotype-anr.png" width="60" alt="funded by l'Agence Nationale de la recherche">](http://www.agence-nationale-recherche.fr/)
