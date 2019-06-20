import { createReducer } from 'redux-starter-kit';

import {
  csvParse,
} from 'd3-dsv';
import {Base64} from 'js-base64';

import {
  FETCH_TABLES_SUCCESS,
  FETCH_DATAPACKAGE_SUCCESS,

} from './repoData';

export const UPDATE_TABLE = 'UPDATE_TABLE';
export const INIT_TABLES = 'INIT_TABLES';

export const initTables = (payload) => ({
  type: INIT_TABLES,
  payload
})

export const updateTable = (payload) => ({
  type: UPDATE_TABLE,
  payload
})

const initialState = {};


export default createReducer(initialState, {
  INIT_TABLES: (state, {payload}) => {
    const tables = {}
    Object.keys(payload).forEach((id) => {
      tables[id] = csvParse(Base64.decode(payload[id].content), (d) => {
        if (d.year) {
          return {
            ...d,
            year: +d.year
          }
        }
        return d
      })
    })
    state.tables = tables
  },
  FETCH_TABLES_SUCCESS: (state, {payload}) => {
    const tables = {}
    Object.keys(payload).forEach((id) => {
      tables[id] = csvParse(Base64.decode(payload[id].content), (d) => {
        if (d.year) {
          return {
            ...d,
            year: +d.year
          }
        }
        return d
      })
    })
    state.tables = tables
  },
  UPDATE_TABLE: (state, {payload}) => {
    const {data, resourceName} = payload;
    const newTable = state.tables[resourceName].slice();
    newTable.splice(newTable.length, 0, ...data)
    state.tables[resourceName] = newTable
  },
})