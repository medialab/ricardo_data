import { createReducer } from 'redux-starter-kit';

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
  HIDE_MODIFICATION: (state, action) => {
    state.modificationIndex = 0
  },
  SELECT_ERROR: (state, action) => {
    const {payload} = action;
    state.modificationIndex = payload.index;
    // if (state.modificationList[payload.index].errorType === 'ERROR_FOREIGN_KEY') {
    //   state.foreignKeyField = state.modificationList[payload.index].field
    // }
    // else {
    //   state.foreignKeyField = null
    // }
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

// SELECTORS
// const getModificationIndex = state => state.ui.modificationIndex;

// const getReferenceResource = state => state.modification.referenceResource;

// export const getTable = createSelector(
  
// )
