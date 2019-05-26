import { createSelector } from 'reselect'

import {Package} from 'datapackage';
import {Table} from 'tableschema';
import {Base64} from 'js-base64';

import {
  csvParse,
} from 'd3-dsv';

import {repoUrl} from '../../config/default';
import {SET_STEP} from './ui';
import {IMPORT_FLOWS} from './flows';

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
  const {descriptor, relations} = payload;
  dispatch(async () => {
    let resource;
    try {
      const dataPackage = await Package.load(descriptor, {basePath: repoUrl});
      resource = dataPackage.getResource('flows');
      
      dispatch({
        type: VALIDATE_RESOURCE_SUCCESS,
        payload: {
          valid: true
        }
      })
    } catch (error) {
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
    try {
      const table = await Table.load(source, {schema});
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
      dispatch({
        type: VALIDATE_HEADER_FAILURE,
        valid: false,
        payload: error
      })
    }
  })
}

export const validateTable = (payload) => (dispatch) => {
  dispatch({
    type: VALIDATE_TABLE_REQUEST,
    payload: {
      ...payload,
      status: 'loading'
    }
  })
  const {source, schema, relations} = payload;

  dispatch(async() => {
    try {
      const table = await Table.load(source, {schema});
      const rows = await table.read({forceCast: true, relations, limit: 500});
      const errors = rows.filter((row) => row.errors)
      if (errors.length) {
        dispatch({
          type: VALIDATE_TABLE_FAILURE,
          payload: {
            status: 'done',
            valid: false,
            errors
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
  tableValidated: 'flows',
  schemaFeedback: null,
  headerFeedback: null,
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
      return state
    case FETCH_TABLES_SUCCESS:
      const tables = {}
      Object.keys(payload).forEach((id) => {
        tables[id] = csvParse(Base64.decode(payload[id].content))
      })
      return {
        ...state,
        tables
      }
    case FETCH_DATAPACKAGE_SUCCESS:
      return {
        ...state,
        descriptor: JSON.parse(Base64.decode(payload.content))
      }
    // case IMPORT_FLOWS:
    //   newDescriptor = {...state.descriptor};
    //   // newDescriptor.resources.forEach((resource)=> {
    //   //   resource.path = `${repoUrl}/${resource.path}`
    //   // });
    //   delete newDescriptor.resources[0].path
    //   // newDescriptor.resources[0].dialect = {
    //   //   delimiter: ';',
    //   //   header: true
    //   // }
    //   newDescriptor.resources[0].data = payload.data
    //   return {
    //     ...state,
    //     descriptor: newDescriptor
    //   }
    // case VALIDATE_RESOURCE_SUCCESS:
    //   return {
    //     ...state,
    //     schemaFeedback: {
    //       valid: true
    //     }
    //   }
    // case VALIDATE_RESOURCE_FAILURE:
    //   return {
    //     ...state,
    //     schemaFeedback: {
    //       valid: false,
    //       ...payload
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

export const getSchema = (state) => {
  const {tableValidated} = state.schemaValidation;
  const resource = state.schemaValidation.descriptor.resources.find((resource) => resource.name === tableValidated);
  return resource.schema
}

export const getRelations = (state) => {
  const foreignKeys = getForeignKeys(state)
  const relations = {};
  foreignKeys.forEach((key) => {
    const tableName = key.reference.resource;
    relations[tableName] = state.schemaValidation.tables[tableName]
  });
  return relations;
}

export const getForeignKeys = (state) => {
  const {tableValidated} = state.schemaValidation;
  const resource = state.schemaValidation.descriptor.resources.find((resource) => resource.name === tableValidated);
  const {foreignKeys} = resource.schema;
  return foreignKeys
}