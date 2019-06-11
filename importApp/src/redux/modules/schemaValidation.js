import { createSelector } from 'reselect'

import {Package, Resource} from 'datapackage';
import {Table} from 'tableschema';
import {Base64} from 'js-base64';

import {
  csvParse,
} from 'd3-dsv';

import {repoUrl} from '../../config/default';
import {SET_STEP} from './ui';
import {IMPORT_FLOWS} from './flows';

import {DEFAULT_CHUNK_SIZE} from '../../constants';

import {
  FETCH_TABLES_SUCCESS,
  FETCH_DATAPACKAGE_SUCCESS,
} from './repoData';


export const VALIDATE_RESOURCE_REQUEST = 'VALIDATE_RESOURCE_REQUEST';
export const VALIDATE_RESOURCE_SUCCESS = 'VALIDATE_RESOURCE_SUCCESS';
export const VALIDATE_RESOURCE_FAILURE = 'VALIDATE_RESOURCE_FAILURE';

export const VALIDATE_TABLE_REQUEST = 'VALIDATE_TABLE_REQUEST';
export const VALIDATE_TABLE_SUCCESS = 'VALIDATE_TABLE_SUCCESS';
export const VALIDATE_TABLE_FAILURE = 'VALIDATE_TABLE_FAILURE';

export const VALIDATE_HEADER_REQUEST = 'VALIDATE_HEADER_REQUEST';
export const VALIDATE_HEADER_SUCCESS = 'VALIDATE_HEADER_SUCCESS';
export const VALIDATE_HEADER_FAILURE = 'VALIDATE_HEADER_FAILURE';

// not used yet
export const validateResource = (payload) => (dispatch) => {
  const {descriptor} = payload;
  dispatch(async () => {
    let resource;
    try {
      // const dataPackage = await Package.load(descriptor);
      // resource = dataPackage.getResource(resourceName);
      resource = Resource.load(descriptor);
      await resource.read()
      
      dispatch({
        type: VALIDATE_RESOURCE_SUCCESS,
        payload: {
          valid: true
        }
      })
    } catch (error) {
      console.log(error)
      if (error.multiple) {
        dispatch({
          type: VALIDATE_RESOURCE_FAILURE,
          payload : {
            rowNumber: error.rowNumber,
            messages: error.errors.map((err) => { 
              return {
              ...err,
              message: err.message
              }
            })
          }
        })
      } else {
        dispatch({
          type: VALIDATE_RESOURCE_FAILURE,
          payload : {
            rowNumber: error.rowNumber,
            messages: [
              {
                ...error,
                message: error.message
              }
            ]
          }
        })
      }
    }
  })
}

export const validateHeader = (payload) => (dispatch) => {
  const {source, schema} = payload;
  dispatch({
    type: VALIDATE_HEADER_REQUEST,
    payload: {
      ...payload,
      status: 'loading'
    }
  })
  dispatch(async() => {
    let table;
    try {
      table = await Table.load(source.slice(0,2), {schema});
      await table.read({limit: 1});
      dispatch({
        type: VALIDATE_HEADER_SUCCESS,
        payload: {
          status: 'done',
          valid: true,
          headers: table.headers
        }
      })
    } catch (error) {
      console.error(error)
      if (error.type !== 'ERROR_HEADER') {
        dispatch({
          type: VALIDATE_HEADER_SUCCESS,
          payload: {
            status: 'done',
            valid: true,
            headers: table.headers
          }
        })
      } else {
        dispatch({
          type: VALIDATE_HEADER_FAILURE,
          valid: false,
          status: 'done',
          payload: error
        })
      }
    }
  })
}

const joinForeignKeyFields = (fields) => {
  if (typeof(fields) === 'string') return fields;
  else return fields.join('|');
};

const getForeignKeyFields = (fields) => {
  return fields.reduce((res, field) => {
    if (typeof(field) === 'string') return res.concat([field]);
    else return res.concat(field)
  }, []);
} 

const getCollectedErrors = (flows, schema, errors) => {
  const {fields, foreignKeys} = schema;

  const allFields = fields.map((field)=> field.name);
  const foreignKeysList = getForeignKeyFields(foreignKeys.map((d) => d.fields));

  const formatFields = fields.filter((field) => foreignKeysList.indexOf(field.name) === -1)
  const foreignKeysFields = foreignKeys.map((foreignKey) => joinForeignKeyFields(foreignKey.fields));

  const errorTypes = ['ERROR_FORMAT', 'ERROR_FOREIGN_KEY'];

  const formatErrors = formatFields.reduce((res, field) => {
    return {
      ...res,
      [field.name]: {
        name: field.name,
        schema: field,
        errorType: 'ERROR_FORMAT',
        errors: []
      }
    }
  }, {});

  const foreignKeyErrors = foreignKeys.reduce((res, foreignKey) => {
    const joinedFields = joinForeignKeyFields(foreignKey.fields);
    // const foreignKeySchema = fields.find((field) => field.name === foreignKey.fields)
    return {
      ...res,
      [joinedFields]: {
        name: joinedFields,
        ...foreignKey,
        errorType: 'ERROR_FOREIGN_KEY',
        errors: []
      }
    }
  }, {});

  errors.forEach((error)=>{
    const row = flows[error.rowNumber -1];
    const rowNumber = error.rowNumber;
    errorTypes.forEach((errorType) => {
      const selectedErrors = error.errors.find((err) => err.type === errorType)
      if(!selectedErrors) return;
      if(errorType === 'ERROR_FORMAT') {
        allFields.forEach((field, columnIndex) => {
          selectedErrors.errors.forEach((err) => {
            if (err.columnNumber === columnIndex + 1 && foreignKeysList.indexOf(field) === -1) {
              const item = {
                rowNumber,
                errorType,
                columnNumber: err.columnNumber,
                field,
                value: row[columnIndex],
                message: err.message
              }
              formatErrors[field].errors.push(item)
            }
          })
        })
      }

      else if (errorType === 'ERROR_FOREIGN_KEY') {
        foreignKeysFields.forEach((fields) => {
          selectedErrors.errors.forEach((err) => {
            // const fieldsList = fields.split('|');
            const joinedColumn = joinForeignKeyFields(err.columnName);
            if (joinedColumn === fields) {
              const values = err.columnName.map((field) => {
                const columnIndex = allFields.indexOf(field);
                return row[columnIndex]
              })
              const item = {
                rowNumber,
                errorType,
                columnName: err.columnName,
                field: joinedColumn,
                value: values.join('|'),
                message: err.message
              }
              foreignKeyErrors[fields].errors.push(item)
            }
          })
        })
      }
    })
  });

  Object.keys(formatErrors).forEach((columnName) => {
    if(!formatErrors[columnName].errors.length) {
      delete formatErrors[columnName]
    }
  });

  Object.keys(foreignKeyErrors).forEach((columnName) => {
    if(!foreignKeyErrors[columnName].errors.length) {
      delete foreignKeyErrors[columnName]
    }
  });
  
  return {
    ...formatErrors,
    ...foreignKeyErrors
  }
}

export const validateTable = (payload) => (dispatch) => {
  const {source, schema, relations} = payload;
  console.log(relations)
  dispatch(async() => {
    try {
      const tableLength = source.length;
      const chunk = DEFAULT_CHUNK_SIZE;
      let i = 0
      let errors = []
      for(i; i < tableLength; i += chunk) {
        dispatch({
          type: VALIDATE_TABLE_REQUEST,
          payload: {  
            status: 'loading',
            loader: `validating ${i} rows`
          }
        })
        const offset = i / chunk
        const chunkTable = [source[0]].concat(source.slice(i+1-offset, i+chunk-offset))
        const table = await Table.load(chunkTable, {schema});
        const rows = await table.read({forceCast: true, relations});
        const chunkErrors = rows.filter((row) => row.errors)
        if (chunkErrors.length) {
          chunkErrors.forEach((error) => {
            error.rowNumber = error.rowNumber + chunk * offset - offset
          });
          errors = errors.concat(chunkErrors)
        }
      }
      // const table = await Table.load(source, {schema});
      // const rows = await table.read({forceCast: true});
      // const errors = rows.filter((row) => row.errors)
      if (errors.length) {
        dispatch({
          type: VALIDATE_TABLE_FAILURE,
          payload: {
            status: 'done',
            valid: false,
            errors,
            collectedErrors: getCollectedErrors(source, schema, errors)
          }
        })
      } else {
        dispatch({
          type: VALIDATE_TABLE_SUCCESS,
          payload: {
            status: 'done',
            valid: true
          }
        })
      }
    } catch (error) {
      console.error(error)
      dispatch({
        type: VALIDATE_TABLE_FAILURE,
        payload: error
      })
    }
  })
}

/**
 * REDUCER
 */

const initialState = {
  resourceName: 'flows',
  schemaFeedback: null,
  headerFeedback: null,
  descriptor: null,
  tables: null
}

export default function reducer(state = initialState, action){
  const {payload} = action;
  switch (action.type){
    case SET_STEP: 
      if (payload.id === '0') {
        return {
          ...state,
          schemaFeedback: null,
          headerFeedback: null,
        }
      }
      return state;
    // case INIT_TABLES:
    // case FETCH_TABLES_SUCCESS:
    //   const tables = {}
    //   Object.keys(payload).forEach((id) => {
    //     tables[id] = csvParse(Base64.decode(payload[id].content), (d) => {
    //       if (d.year) {
    //         return {
    //           ...d,
    //           year: +d.year
    //         }
    //       }
    //       return d
    //     })
    //   })
    //   return {
    //     ...state,
    //     tables
    //   }
    case FETCH_DATAPACKAGE_SUCCESS:
      return {
        ...state,
        descriptor: JSON.parse(Base64.decode(payload.content))
      }
    // case UPDATE_TABLE:
    //   const {row, resourceName} = payload;
    //   const newTable = state.tables[resourceName].slice();
    //   newTable.splice(newTable.length, 0, row);
    //   delete state.tables[resourceName]      
    //   return {
    //     ...state,
    //     tables: {
    //       ...state.tables,
    //       [resourceName]: newTable
    //     }
    //   }
    case VALIDATE_HEADER_REQUEST: 
    case VALIDATE_HEADER_FAILURE:
    case VALIDATE_HEADER_SUCCESS:
      return {
        ...state,
        headerFeedback: payload
      }
    case VALIDATE_TABLE_REQUEST: 
    case VALIDATE_TABLE_FAILURE:
    case VALIDATE_TABLE_SUCCESS: 
      return {
        ...state,
        schemaFeedback: payload
      }
    default:
    return state
  }
}

/** 
* SELECTORS
*/

const getResourceName = state => state.schemaValidation.resourceName;
const getResources = state => state.schemaValidation.descriptor.resources;
const getTables = state => state.tables.tables;

export const getResourceSchema = createSelector(
  getResourceName,
  getResources,
  (resourceName, resources) => {
    const selectedResource = resources.find((resource) => resource.name === resourceName);
    return selectedResource.schema
})

export const getRelations = createSelector(
  getResourceName,
  getResources,
  getTables,
  (resourceName, resources, tables) => {
    const selectedResource = resources.find((resource) => resource.name === resourceName);
    const relations = {};
    selectedResource.schema.foreignKeys.forEach((key) => {
      const tableName = key.reference.resource;
      relations[tableName] = tables[tableName]
      console.log(tables)
    });
    return relations;
})