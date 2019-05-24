import {get} from 'axios';
import {apiUri, repoUrl} from '../../config/default';
import { Base64 } from 'js-base64';

export const FETCH_TABLE_REQUEST = 'FETCH_TABLE_REQUEST';
export const FETCH_TABLE_SUCCESS = 'FETCH_TABLE_SUCCESS';
export const FETCH_TABLE_FAILURE = 'FETCH_TABLE_FAILURE';

export const FETCH_DATAPACKAGE_REQUEST = 'FETCH_DATAPACKAGE_REQUEST';
export const FETCH_DATAPACKAGE_SUCCESS = 'FETCH_DATAPACKAGE_SUCCESS';
export const FETCH_DATAPACKAGE_FAILURE = 'FETCH_DATAPACKAGE_FAILURE';

export const FETCH_TABLES_REQUEST = 'FETCH_TABLES_REQUEST';
export const FETCH_TABLES_SUCCESS = 'FETCH_TABLES_SUCCESS';
export const FETCH_TABLES_FAILURE = 'FETCH_TABLES_FAILURE';



export const tablesList = [
  {
    name: 'sources',
    path: 'data/sources.csv'
  },
  // {
  //   name: 'RICentities',
  //   path: 'data/RICentities.csv'
  // },
  // {
  //   name: 'RICentities_groups',
  //   path: 'data/RICentities_groups.csv'
  // },
  // {
  //   name: 'currencies',
  //   path: 'data/currencies.csv'
  // },
  {
    name: 'entity_names',
    path: 'data/entity_names.csv'
  },
  // {
  //   name: 'exchange_rates',
  //   path: 'data/exchange_rates.csv'
  // },
  // {
  //   name: 'expimp_spegen',
  //   path: 'data/expimp_spegen.csv'

  // }
];

/**
 * ACTIONS
 */
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


/**
 * REDUCER
 */

const initialState = {}

export default function reducer(state = initialState, action){
  const {payload} = action;
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
        descriptor: JSON.parse(Base64.decode(payload.content))
      }
    default:
      return state
  }
}