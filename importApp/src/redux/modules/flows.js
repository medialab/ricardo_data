import { createReducer } from 'redux-starter-kit';

import {SET_STEP} from './ui';

export const UPDATE_FLOWS = 'UPDATE_FLOWS';
export const IMPORT_FLOWS = 'IMPORT_FLOWS';
export const EXPORT_FLOWS = 'EXPORT_FLOWS';

export const updateFlows = (payload) => ({
  type: UPDATE_FLOWS,
  payload
});

export const importFlows = (payload) => ({
  type: IMPORT_FLOWS,
  payload
});

export const exportFlows = (payload) => ({
  type: EXPORT_FLOWS
});


const initialState = {}

export default createReducer(initialState, {
  SET_STEP: (state, action) => {
    const {payload} = action;
    if (payload.id === '0') {
      return initialState
    }
  },
  IMPORT_FLOWS: (state, action) => {
    const {payload} = action;
    return payload
  },
  UPDATE_FLOWS: (state, action) => {
    const {payload} = action;
    const {errors, field, fixedValue} = payload;
    const columnNumber = state.data[0].indexOf(field);
    errors.forEach((error) => {
      state.data[error.rowNumber -1][columnNumber] = fixedValue;
    })
  }
})
