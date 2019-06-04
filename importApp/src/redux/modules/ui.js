export const SET_STEP = 'SET_STEP';
export const SHOW_MODIFICATION = 'SHOW_MODIFICATION';
export const HIDE_MODIFICATION = 'HIDE_MODIFICATION';

export const GO_NEXT_ERROR = 'GO_NEXT_ERROR';
export const GO_PREV_ERROR = 'GO_PREV_ERROR';
export const SELECT_ERROR = 'SELECT_ERROR';



export const setStep = (payload) => ({
  type: SET_STEP,
  payload
});

export const showModification = () => ({
  type: SHOW_MODIFICATION,
});

export const hideModification = () => ({
  type: HIDE_MODIFICATION,
});

export const selectError = (payload) => ({
  type: SELECT_ERROR,
  payload
});

export const goPrevError = () => ({
  type: GO_PREV_ERROR,
});

export const goNextError = () => ({
  type: GO_NEXT_ERROR,
});

const steps = [
  {
    id: '0',
    name: 'Upload file',
    title: 'Choose a file'
  },
  {
    id: '1',
    name: 'Schema Validation',
    title: 'Schema validation against datapackage'
  },
  {
    id: '2',
    name: 'Error Fixing',
    title: 'Fix errors by fields'
  },
  // {
  //   id: '3',
  //   name: 'Export/Publish Data',
  //   title: 'Export or Publish your data to Github'
  // }
];

const initialState = {
  steps, 
  selectedStep: steps[0],
  isModification: false,
  modificationIndex: 0
}

export default function reducer(state = initialState, action){
  const {payload} = action;
  switch (action.type){
    case SET_STEP:
      return {
        ...initialState,
        selectedStep: steps.find((step) => payload.id === step.id),
      }
    case SHOW_MODIFICATION:
      return {
        ...state,
        isModification: true,
        modificationIndex: 0
      }
    case HIDE_MODIFICATION:
      return {
        ...state,
        isModification: false,
        modificationIndex: 0
      }
    case SELECT_ERROR: 
      return {
        ...state,
        isModification: true,
        modificationIndex: payload.index
      }
    case GO_NEXT_ERROR:
      return {
        ...state,
        modificationIndex: state.modificationIndex + 1
      }
    case GO_PREV_ERROR:
      if (state.modificationIndex === 0) return;
      return {
        ...state,
        modificationIndex: state.modificationIndex - 1
      }
    default:
     return state
  }
}