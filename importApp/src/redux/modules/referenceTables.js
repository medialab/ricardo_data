import { createReducer } from 'redux-starter-kit';

import {
  csvParse,
} from 'd3-dsv';

import {isEqual, mapValues} from 'lodash';


export const ADD_TABLE_ROW = 'ADD_TABLE_ROW';
export const INIT_TABLES = 'INIT_TABLES';
export const DELETE_TABLE_ROW = 'DELETE_TABLE_ROW';

export const initTables = () => ({
  type: INIT_TABLES,
})

export const addTableRow = (payload) => ({
  type: ADD_TABLE_ROW,
  payload
})

export const deleteTableRow = (payload) => ({
  type: DELETE_TABLE_ROW,
  payload
})

const initialState = {};


export default createReducer(initialState, {
  INIT_TABLES: (state) => {
    return initialState;
  },
  FETCH_TABLES_SUCCESS: (state, {payload}) => {
    const referenceTables = {}
    const originalLength = {}
    Object.keys(payload).forEach((id) => {
      // TODO : use datapackage to load those data
      referenceTables[id] = csvParse(payload[id], (d) => {
        const newD = mapValues(d, (v,k) => {
          //cast year to integer
          if (k === 'year')
            return +v
          // cast empty string to null (in datapackage '' default to missing value)
          if (v === '')
            return null
          return v
        });
        return newD;
      })
      originalLength[id] = referenceTables[id].length
    })
    state.referenceTables = referenceTables;
    state.originalLength = originalLength
  },
  DELETE_TABLE_ROW: (state, {payload}) => {
    const {data, resourceName} = payload;
    let newTable = state.referenceTables[resourceName].slice();
    newTable = newTable.filter((row) =>{
      return !data.some((r) => { return isEqual(row, r) })
    });
    state.referenceTables[resourceName] = newTable
  },
  ADD_TABLE_ROW: (state, {payload}) => {
    const {data, resourceName} = payload;
    const newTable = state.referenceTables[resourceName].slice();
    newTable.splice(newTable.length, 0, ...data);
    state.referenceTables[resourceName] = newTable;
  },
})