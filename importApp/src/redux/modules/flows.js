import { createReducer } from 'redux-starter-kit';

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
    const {errors, fixedValues} = payload;
    const fieldList = Object.keys(fixedValues)
    errors.forEach((error) => {
      fieldList.forEach((field) => {
        const columnNumber = state.data[0].indexOf(field);
        state.data[error.rowNumber -1][columnNumber] = fixedValues[field];
      })
    })
  }
})
