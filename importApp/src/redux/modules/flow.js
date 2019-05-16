export const UPDATE_FLOW = 'UPDATE_FLOW';
export const IMPORT_FLOW = 'IMPORT_FLOW';

export const updateFlow = (payload) => ({
  type: UPDATE_FLOW,
  payload
});

export const importFlow = (payload) => ({
  type: IMPORT_FLOW,
  payload
});


const initialState = {}

export default function reducer(state = initialState, action){
  const {payload} = action;
  switch (action.type){
    case IMPORT_FLOW: 
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