export const UPDATE_FLOW = 'UPDATE_FLOW';

export const updateFlow = (payload) => ({
  type: UPDATE_FLOW,
  payload
});


const initialState = {}

export default function reducer(state = initialState, action){
  const {payload} = action;
  switch (action.type){
    case UPDATE_FLOW: 
      return payload;
    default:
     return state
  }
}