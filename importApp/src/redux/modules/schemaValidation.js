import { createSelector } from 'reselect'

import {groupBy, sortBy, values, max, min,difference, keys, uniq} from 'lodash';
import {Package, Resource} from 'datapackage';
import {Table} from 'tableschema';
import {Base64} from 'js-base64';

import {
  csvParse,
} from 'd3-dsv';

import {repoUrl} from '../../config/default';
import {SET_STEP} from './ui';
import {IMPORT_FLOWS} from './flows';

import {DEFAULT_CHUNK_SIZE, RANKED_FIELDS} from '../../constants';

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

export const REVALIDATE_ROWS_REQUEST = 'REVALIDATE_ROWS_REQUEST';
export const REVALIDATE_ROWS_SUCCESS = 'REVALIDATE_ROWS_SUCCESS';
export const REVALIDATE_ROWS_FAILURE = 'REVALIDATE_ROWS_FAILURE';


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
  // const foreignKeysList = getForeignKeyFields(foreignKeys.map((d) => d.fields));
  // TODO: hardcoded
  const foreignKeysList = ["source", "export_import", "special_general", "currency"];

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
    const {rowNumber, originalRowNumber} = error;
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
                originalRowNumber,
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
  if (formatErrors['reporting'] || formatErrors['partner']) {
    return formatErrors
  }
  return {
    ...formatErrors,
    ...foreignKeyErrors
  }
}

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
      console.error(error)
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

export const revalidateRows = (payload) => (dispatch) => {
  const {rowNumbers, fixedValues, source, schema, relations, prevErrors} = payload;
  dispatch({
    type: REVALIDATE_ROWS_REQUEST,
    payload: {
      ...payload,
      status: 'loading'
    }
  })
  dispatch(async() => {
    let table;
    try {
      table = await Table.load(source, {schema});
      const rows = await table.read({keyed:true, forceCast: true, relations});
      let successRows = [];
      let successValues;
      rows.forEach((row, index) => {
        if (row.errors) {
          row.originalRowNumber = rowNumbers[index]
        }
        else successRows.push(row)
      });

      if(successRows.length > 0) {
        successValues = keys(groupBy(successRows, (v)=> v.currency + v.reporting))
      };

      const errors = rows.filter((row) => row.errors);
      let newErrors;
      let orderedErrors;

      const collectedErrors = getCollectedErrors(source, schema, errors);

      if (collectedErrors && collectedErrors['currency|year|reporting']) {
        collectedErrors['currency|year|reporting'].errors.forEach((error) => error.rowNumber = error.originalRowNumber);
        const updatedErrors = collectedErrors['currency|year|reporting'].errors;

        const updatedRowNumbers = updatedErrors.map((e)=> e.rowNumber);
        const successRowNumbers = difference(rowNumbers, updatedRowNumbers);
        
        newErrors = prevErrors
          .filter((error) => successRowNumbers.indexOf(error.rowNumber) === -1)
          .map((error)=> {
          if (updatedRowNumbers.indexOf(error.rowNumber) !== -1) {
            const updatedError = updatedErrors.find((e)=> e.rowNumber === error.rowNumber);
            return updatedError;
          }
          return error;
        });

        orderedErrors = getOrderedErrors({
          'currency|year|reporting': {
            ...collectedErrors['currency|year|reporting'],
            errors: newErrors
          }
        });
        dispatch({
          type: REVALIDATE_ROWS_FAILURE,
          payload: {
            status: 'done',
            valid: false,
            fixedValues,
            successValues,
            newErrors,
            orderedErrors
          }
        })
      }
      else {
        newErrors = prevErrors.filter((error) => rowNumbers.indexOf(error.rowNumber) === -1);
        orderedErrors = getOrderedErrors({
          'currency|year|reporting': {
            errors: newErrors
          }
        });
        if (newErrors.length) {
          dispatch({
            type: REVALIDATE_ROWS_SUCCESS,
            payload: {
              status: 'done',
              valid: false,
              fixedValues,
              newErrors,
              orderedErrors
            }
          })
        }
        else {
          dispatch({
            type: REVALIDATE_ROWS_SUCCESS,
            payload: {
              rowNumbers,
              status: 'done',
              valid: true,
              fixedValues,
              newErrors,
              orderedErrors
            }
          })
        }
      }
    } catch (error) {
      console.error(error)
      dispatch({
        type: REVALIDATE_ROWS_FAILURE,
        payload: {
          status: 'done',
          valid: false,
          error
        }
      })

    }
  })
}

export const validateTable = (payload) => (dispatch) => {
  const {source, schema, relations} = payload;
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
}

export default function reducer(state = initialState, action){
  const {payload} = action;
  let newErrors;
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
    case FETCH_DATAPACKAGE_SUCCESS:
      return {
        ...state,
        descriptor: JSON.parse(Base64.decode(payload.content))
      }
    case REVALIDATE_ROWS_SUCCESS:
      // newErrors = state.schemaFeedback.collectedErrors['currency|year|reporting'].errors
      //                   .filter((error) => payload.rowNumbers.indexOf(error.rowNumber) === -1);
      return {
        ...state,
        schemaFeedback: {
          ...state.schemaFeedback,
          collectedErrors: {
            ...state.schemaFeedback.collectedErrors,
            'currency|year|reporting': null
          }
        }
      }
    case REVALIDATE_ROWS_FAILURE:
      if (payload.newErrors) {
        return {
          ...state,
          schemaFeedback: {
            ...state.schemaFeedback,
            collectedErrors: {
              ...state.schemaFeedback.collectedErrors,
              'currency|year|reporting': {
                errors: payload.newErrors
              }
            }
          }
        }
      }
      return state;
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

const re = /row\s\d*/;
export const getOrderedErrors = (collectedErrors) => {
  const errorsList = values(collectedErrors).reduce((res, item) => {
    return res.concat(item.errors)
  },[]);

  const groupedErrorsList = 
    values(groupBy(errorsList,(v) => {
      if (v.field !== 'currency|year|reporting') return (v.field + v.value)
      else {
        const groupedValue = v.value.split('|')[0] + v.value.split('|')[2]
        return v.field + groupedValue
      }
    }))
    .map((errors, index)=> {
      const fieldName = errors[0].field;
      let yearRange;
      if (fieldName === 'currency|year|reporting') {
        const years = uniq(errors.map((error) => error.value.split('|')[1]));
        yearRange = years.length > 1 ? `${min(years)}-${max(years)}` : years[0]
      }
      const value = fieldName !== 'currency|year|reporting' ? errors[0].value : `${errors[0].value.split('|')[0]}|${yearRange}|${errors[0].value.split('|')[2]}`
      return {
        index,
        field: errors[0].field,
        errorType: errors[0].errorType,
        fixed: false,
        message: errors[0].message.replace(re, `${errors.length} rows`),
        value, 
        errors
      }
    });
  return sortBy(groupedErrorsList, (field) => {
    return RANKED_FIELDS[field.name]
  });
}

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
    });
    return relations;
})