# Ricardo data validation app

This server-less web application has been developed to help researchers add new data in the repository.
It uses the [tabular data package](https://datahub.io/docs/data-packages/tabular) formalization to guide the user into the necessary data integration tasks to create all the metadata which converts the source data into the RICardo classifications (place into RICnames, currency exchange rate to pound sterling...).   

## Main features

- a web user interface
- uses github API to interact with the repository (restricted to authorized github users)
- automatically retrieve the current RICardo data-package
- import new trade flow data file
- uses data-package JavaScript library to validate flow data
- group data line by validation error to ease solving many common issues at once
- proposes dedicated form to solve the validation issues
- allow to browse data lines while solving validation issues
- can be used to solve foreign key validation issues
- can handle RICardo data-package chains of references (multilevel foreign keys)
- detect overlapping validation errors and manage error groups dependencies
- revalidate the impacted data line after correction
- push the updated data files back to the data repository using one specific branch by user
- possibility to download the corrected data before pushing

See [the app screenshots](./doc/readme.md).


## limitations

### multi-user collaboration

Adding new data demands to edit the metadata (RICentities, currencies, exchange rates...) which adapt the source data into a common framework for quantitative analysis.
If the flow data are grouped by source on the repository isolating updates, the metadata are shared across sources.
Updates on metadata files needs to be shared and reused after each update.
The current workflow uses one branch by user (the branch is name after the username). Each user works one a pipeline of edits chaining updates.
This workflow is not the good one for a multiple users approach as we need to merge in master and back to users branch before each change of users. This might need a better solution at some point but whatever the workflow edits should never be made in parallel but in series to avoid conflicts on metadata tables.

### specific to RICardo
The app has been designed specifically to deal with the RICardo data-package. 
Some specific code has been added to ease data edition tuned specifically for RIcardo needs.
The main ideas and architecture might be reused as inspiration to a more generic approach but this code is specific.

### auth to github

We are using a personal access token to connect to github to avoid using a server to handle the Oauth dialog. 

## stack

- react
- datapackage.js
- redux


## Development
### `npm start`

## Build the app
### `npm run build`

## Deploy the app on github.io
### `npm run deploy`