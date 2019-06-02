export const SET_STEP = 'SET_STEP';

export const setStep = (payload) => ({
  type: SET_STEP,
  payload
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
  //   name: 'Data Validation',
  //   title: 'Data validation'
  // },
  // {
  //   id: '4',
  //   name: 'Export/Publish Data',
  //   title: 'Export or Publish your data to Github'
  // }
];

const initialState = {
  steps, 
  selectedStep: steps[0]
}

export default function reducer(state = initialState, action){
  const {payload} = action;
  switch (action.type){
    case SET_STEP:
      return {
        ...state,
        selectedStep: steps.find((step) => payload.id === step.id)
      }
    default:
     return state
  }
}