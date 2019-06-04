import {SET_STEP} from './ui';

export const UPDATE_FLOW = 'UPDATE_FLOW';
export const IMPORT_FLOWS = 'IMPORT_FLOWS';

export const updateFlow = (payload) => ({
  type: UPDATE_FLOW,
  payload
});

export const importFlows = (payload) => ({
  type: IMPORT_FLOWS,
  payload
});


const initialState = {}

export default function reducer(state = initialState, action){
  const {payload} = action;
  switch (action.type){
    case SET_STEP:
      if(payload.id === '0') {
        return initialState;
      }
      return state;
    case IMPORT_FLOWS: 
      return payload;
    case UPDATE_FLOW:
      return {
        ...state,
        data: payload.data
      };
    default:
     return state
  }
}