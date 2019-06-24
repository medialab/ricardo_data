import {all, get, put, post, spread} from 'axios';
import {apiUri, branchUri, referenceUri} from '../../config/default';
import {pick} from 'lodash';

import { Base64 } from 'js-base64';
import {
  csvFormat
} from 'd3-dsv';

import {INIT_TABLES} from './referenceTables';

export const FETCH_TABLE_REQUEST = 'FETCH_TABLE_REQUEST';
export const FETCH_TABLE_SUCCESS = 'FETCH_TABLE_SUCCESS';
export const FETCH_TABLE_FAILURE = 'FETCH_TABLE_FAILURE';

export const FETCH_DATAPACKAGE_REQUEST = 'FETCH_DATAPACKAGE_REQUEST';
export const FETCH_DATAPACKAGE_SUCCESS = 'FETCH_DATAPACKAGE_SUCCESS';
export const FETCH_DATAPACKAGE_FAILURE = 'FETCH_DATAPACKAGE_FAILURE';

export const FETCH_TABLES_REQUEST = 'FETCH_TABLES_REQUEST';
export const FETCH_TABLES_SUCCESS = 'FETCH_TABLES_SUCCESS';
export const FETCH_TABLES_FAILURE = 'FETCH_TABLES_FAILURE';

export const FETCH_BRANCHES_REQUEST = 'FETCH_BRANCHES_REQUEST';
export const FETCH_BRANCHES_SUCCESS = 'FETCH_BRANCHES_SUCCESS';
export const FETCH_BRANCHES_FAILURE = 'FETCH_BRANCHES_FAILURE';

export const CREATE_BRANCH_REQUEST = 'CREATE_BRANCH_REQUEST';
export const CREATE_BRANCH_SUCCESS = 'CREATE_BRANCH_SUCCESS';
export const CREATE_BRANCH_FAILURE = 'CREATE_BRANCH_FAILURE';

export const UPDATE_REMOTE_FILES_REQUEST = 'UPDATE_REMOTE_FILES_REQUEST';
export const UPDATE_REMOTE_FILES_SUCCESS = 'UPDATE_REMOTE_FILES_SUCCESS';
export const UPDATE_REMOTE_FILES_FAILURE = 'UPDATE_REMOTE_FILES_FAILURE';

export const SELECT_BRANCH = 'SELECT_BRANCH';

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

/**
 * ACTIONS
 */

export const selectBranch = (payload) => ({
  type: SELECT_BRANCH,
  payload
})

export const fetchBranches = (payload) => (dispatch) => {
  dispatch({
    type: FETCH_BRANCHES_REQUEST,
    payload
  });
  return get(branchUri)
  .then((res) => {
    return dispatch({
      type: FETCH_BRANCHES_SUCCESS,
      payload: {
        ...payload,
        branches: res.data
      }
    })
  }).catch((error) => dispatch({
    type: FETCH_BRANCHES_FAILURE,
    payload,
    error
  }))
}

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

export const updateRemoteFiles = (payload) => (dispatch) => {
  dispatch({
    type: UPDATE_REMOTE_FILES_REQUEST,
    payload
  });
  const {files, branch, auth} = payload;
  
  const requests = files.map((file) => {
    const data = {
      message: 'test update',
      content: Base64.encode(csvFormat(file.data)),
      sha: file.sha,
      branch
    }
    return put(`${apiUri}/data/${file.fileName}`, data, {
      auth: {
        username: auth.username,
        password: auth.token
      }
    })
    .catch((error) => ({error})) 
  })

  all(requests)
  .then((res) => {
    console.log(res)
    // const responses = res.map((response) => {
    //   if(response.error) {
    //     return response.error.response
    //   } else return response
    // })
    dispatch({
      type: UPDATE_REMOTE_FILES_SUCCESS,
      payload: {responses: res}
    });
  })
  .catch((error) => {
    console.error(error);
    dispatch({
      type: UPDATE_REMOTE_FILES_FAILURE,
      error
    });
  })
}

export const createBranch = (payload) => (dispatch) => {
  dispatch({
    type: CREATE_BRANCH_REQUEST
  });

  const {auth, branch, reference} = payload;
  const data = {
    "ref": `refs/heads/${branch}`,
    "sha": reference.sha
  };
  
  return post(referenceUri, data, {
    auth: {
      username: auth.username,
      password: auth.token
    }
  })
  .then((res) => dispatch({
    type: CREATE_BRANCH_SUCCESS,
    payload: {
      name: auth.username,
      ref: res.data
    }
  })).catch((error) => dispatch({
    type: CREATE_BRANCH_FAILURE,
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
    case INIT_TABLES:
      return {
        ...state,
        tables: null
      }
    case FETCH_TABLES_SUCCESS:
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
    case FETCH_BRANCHES_SUCCESS:
      return {
        ...state,
        branches: payload.branches
      }
    case CREATE_BRANCH_SUCCESS:
      return {
        ...state,
        selectedBranch: payload,
        branchToCreated: null
      }
    case SELECT_BRANCH:
      const selectedBranch = state.branches.find((branch) => branch.name === payload.branch);
      if (selectedBranch) {
        return {
          ...state,
          selectedBranch,
          tables: null
        }
      } else {
        return {
          ...state,
          branchToCreated: payload.branch,
          selectedBranch: null,
          tables: null
        }
      }
    case UPDATE_REMOTE_FILES_SUCCESS:
      const {responses} = payload;
      return {
        ...state,
        remoteFilesUpdated: "updated",
        remoteReponse: responses
      }
    case UPDATE_REMOTE_FILES_FAILURE:
      return {
        ...state,
        remoteFilesUpdated: "fail"
      }
    default:
      return state
  }
}