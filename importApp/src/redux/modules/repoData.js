import {get} from 'axios';
import {Package, Resource} from 'datapackage';

import {apiUri, repoUrl} from '../../config/default';

import {IMPORT_FLOWS} from './flows';

export const FETCH_TABLE_REQUEST = 'FETCH_TABLE_REQUEST';
export const FETCH_TABLE_SUCCESS = 'FETCH_TABLE_SUCCESS';
export const FETCH_TABLE_FAILURE = 'FETCH_TABLE_FAILURE';

export const FETCH_DATAPACKAGE_REQUEST = 'FETCH_DATAPACKAGE_REQUEST';
export const FETCH_DATAPACKAGE_SUCCESS = 'FETCH_DATAPACKAGE_SUCCESS';
export const FETCH_DATAPACKAGE_FAILURE = 'FETCH_DATAPACKAGE_FAILURE';

export const FETCH_TABLES_REQUEST = 'FETCH_TABLES_REQUEST';
export const FETCH_TABLES_SUCCESS = 'FETCH_TABLES_SUCCESS';
export const FETCH_TABLES_FAILURE = 'FETCH_TABLES_FAILURE';

export const VALIDATE_RESOURCE_REQUEST = 'VALIDATE_RESOURCE_REQUEST';
export const VALIDATE_RESOURCE_SUCCESS = 'VALIDATE_RESOURCE_SUCCESS';
export const VALIDATE_RESOURCE_FAILURE = 'VALIDATE_RESOURCE_FAILURE';


export const tablesList = [
  {
    name: 'sources',
    path: 'data/sources.csv'
  },
  {
    name: 'RICentities',
    path: 'data/RICentities.csv'
  },
  {
    name: 'RICentities_groups',
    path: 'data/RICentities_groups.csv'
  },
  {
    name: 'currencies',
    path: 'data/currencies.csv'
  },
  {
    name: 'entity_names',
    path: 'data/entity_names.csv'
  },
  {
    name: 'exchange_rates',
    path: 'data/exchange_rates.csv'
  },
  {
    name: 'expimp_spegen',
    path: 'data/expimp_spegen.csv'

  }
];

export const fetchTable = (payload) => (dispatch) => {
  const {branch, table} = payload
  dispatch({
    type: FETCH_TABLE_REQUEST,
    payload
  });
  return get(`${apiUri}/${table.path}?ref=${branch}`)
    .then((res) => dispatch({
      type: FETCH_TABLE_SUCCESS,
      payload: {
        ...payload,
        data: res.data
      }
    })).catch((error) => dispatch({
      type: FETCH_TABLE_FAILURE,
      payload,
      error
    }))
}

export const fetchAllTables = (payload) => (dispatch) => {
  const {branch} = payload;
  dispatch({
    type: FETCH_TABLES_REQUEST,
  });
  Promise.all(tablesList.map((table) => {
    return get(`${apiUri}/${table.path}?ref=${branch}`)
  }))
  .then((res) => {
    let tables = {}
    res.forEach((item) => {
      const id = item.data.name.split('.')[0]
      tables[id] = item.data
    })
    dispatch({
      type: FETCH_TABLES_SUCCESS,
      payload: tables
    })
  })
  .catch((error) => dispatch({
    type: FETCH_TABLES_FAILURE,
    payload,
    error
  }))
}

export const fetchDatapackage = () => (dispatch) => {
  dispatch({
    type: FETCH_DATAPACKAGE_REQUEST,
  });
  return get(`${apiUri}/datapackage.json?ref=master`)
    .then((res) => dispatch({
      type: FETCH_DATAPACKAGE_SUCCESS,
      payload: res.data
    })).catch((error) => dispatch({
      type: FETCH_DATAPACKAGE_FAILURE,
      error
    }))
}

export const validateResource = (payload) => (dispatch) => {
  dispatch(async () => {
    let resource;
    try {
      const {descriptor, relations} = payload;
      const dataPackage = await Package.load(descriptor, {basePath: repoUrl});
      resource = dataPackage.getResource('flows');
      await resource.read({relations});

      dispatch({
        type: VALIDATE_RESOURCE_SUCCESS
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

const initialState = {}

export default function reducer(state = initialState, action){
  const {payload} = action;
  let newDescriptor;
  switch (action.type){
    case FETCH_TABLES_SUCCESS:
      // newDescriptor = {...state.descriptor};
      // newDescriptor.resources.forEach((resource)=> {
      //   if (payload[resource.name]) {
      //     delete resource.path;
      //     resource.data = csvParseRows(atob(payload[resource.name].content))
      //   }
      // });
      return {
        ...state,
        tables: payload
      }
    case FETCH_DATAPACKAGE_SUCCESS:
      return {
        ...state,
        datapackage: payload,
        descriptor: JSON.parse(atob(payload.content))
      }
    case IMPORT_FLOWS:
      newDescriptor = {...state.descriptor};
      // newDescriptor.resources.forEach((resource)=> {
      //   resource.path = `${repoUrl}/${resource.path}`
      // });
      delete newDescriptor.resources[0].path
      // newDescriptor.resources[0].dialect = {
      //   delimiter: ';',
      //   header: true
      // }
      newDescriptor.resources[0].data = payload.data
      return {
        ...state,
        descriptor: newDescriptor
      }
    case VALIDATE_RESOURCE_SUCCESS:
      return {
        ...state,
        schemaFeedback: {
          valid: true
        }
      }
    case VALIDATE_RESOURCE_FAILURE:
      return {
        ...state,
        schemaFeedback: {
          valid: false,
          ...payload
        }
      }
      
    default:
     return state
  }
}
