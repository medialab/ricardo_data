import { createReducer } from 'redux-starter-kit';
import {values, isEqual} from 'lodash'
import {SET_STEP} from './ui';

export const SUBMIT_MODIFICATION = 'SUBMIT_MODIFICATION';
export const START_MODIFICATION = 'START_MODIFICATION';

export const startModification = (payload) => ({
  type: START_MODIFICATION,
  payload
});

export const submitModification = (payload) => ({
  type: SUBMIT_MODIFICATION,
  payload
});


const initialState = {
  foreignKeyField: null,
  modificationIndex: 0,
  modificationList: null
}

export default createReducer(initialState, {
  SET_STEP: (state, action) => {
    const {payload} = action;
    if (payload.id === '0') {
      return initialState
    }
  },
  START_MODIFICATION: (state, action) => {
    const {payload} = action;
    state.modificationList = payload
    state.modificationIndex = 0
  },
  REVALIDATE_ROWS_SUCCESS: (state, action) => {
    // case 1: only year format error, no foreignkey error
    const {payload} = action;
    const {originalValue, fixedValues} = payload;
    state.modificationList
    .forEach((item, index) => {
      if (item.field === 'currency|year|reporting' && item.value.split("|")[1] === ''+originalValue) {
        state.modificationList[index] = {
          ...state.modificationList[index],
          fixed: true,
          fixedStatus: 'autoFixed',
          unchangable: true,
          fixedValues: {
            'currency': item.value.split('|')[0],
            'year': fixedValues['year'],
            'reporting': item.value.split('|')[2]
          }
        }
      }
    })
  },
  REVALIDATE_ROWS_FAILURE: (state, action) => {
    // case 2,3: voilation relations
    const {payload} = action;
    const {fixedValues, rowNumbers} = payload;
    state.modificationList
    .forEach((item, index) => {
      const errorRowNumbers = item.errors.map((err) => err.rowNumber);
      if (item.field === 'currency|year|reporting' && isEqual(errorRowNumbers, rowNumbers)) {
        const fixedValue = item.value.split("|")[0] + '|' + fixedValues['year'] + '|' + item.value.split("|")[2];
        const existItem = state.modificationList.find((item) => item.value === fixedValue)
        if ( existItem && existItem.index !== index) {
          // case 2: fixed formatted year rows values of (currency|year|reporting) are same with other rows
          state.modificationList[index] = {
            ...state.modificationList[index],
            fixed: true,
            fixedStatus: 'fixInOther',
            unchangable: true,
            fixedValues: {
              'currency': item.value.split('|')[0],
              'year': fixedValues['year'],
              'reporting': item.value.split('|')[2]
            }
          }
        } else {
          // case 3: fixed formatted year rows are new combo of (currency|year|reporting)
          state.modificationList[index] = {
            ...state.modificationList[index],
            fixed: false,
            fixedStatus: 'notFixed',
            unchangable: false,
            value: fixedValue,
            fixedValues: null
          }
        } 
      }
    })
  },
  HIDE_MODIFICATION: (state, action) => {
    state.modificationIndex = 0
  },
  SELECT_ERROR: (state, action) => {
    const {payload} = action;
    state.modificationIndex = payload.index;
  },
  GO_NEXT_ERROR: (state, action) => {
    state.modificationIndex = state.modificationIndex + 1
  },
  GO_PREV_ERROR: (state, action) => {
    if (state.modificationIndex > 0) {
      state.modificationIndex = state.modificationIndex - 1
    }
  },
  SUBMIT_MODIFICATION: (state, action) => {
    const {payload} = action;
    state.modificationList[payload.index] = {
      ...state.modificationList[payload.index],
      ...payload,
      fixed: true
    }
  }
})

