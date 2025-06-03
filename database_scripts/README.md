# Database scripts

Set of scripts to create and manage RICardo data.

To execute a script you need a python 3 environment with the requirement.prod.txt dependencies installed.

```bash
pyenv install 3.10
pyenv virtulenv 3.10 ricardo_data
pyenv activate ricardo_data
cd database_scripts
python flows.py {command}
```

## aggregate

Aggregate all flows data found in `/data/flows/*.csv` into on `data/flows.csv` file.

## aggregate_datapackage

Aggregate all flows data listed in the datapackage into on `data/flows.csv` file.

> This needs the datapackage python library to be installed.

## control_flow_files

This command check if the list of flow files on file system and in the datapackage are aligned.

## deduplicate

This command will load all the trade flows into a sql database and remove the duplicated trade flows caused by more than one source describing the same flows, general/special trade...

## homogenize_partners

This command will try to homogenize trade partners at the GeoPolhist level by:

- disaggregate flows to groups of trade partners
- aggregate flows to many `city/part of` the same entity

/!\ This is experimental work-in-progress not validated.


## RICardo website

This RICardo website shows data created by doing : 

- aggregate
- deduplicate

The trade partners homogenization is currently under development.