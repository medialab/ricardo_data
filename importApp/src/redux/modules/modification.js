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
  },
  SUBMIT_MODIFICATION: (state, action) => {
    const {payload} = action;
    state.modificationList[payload.index].fixed = true
  }
})

