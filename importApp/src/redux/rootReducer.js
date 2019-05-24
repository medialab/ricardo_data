import { combineReducers } from 'redux'
import ui from './modules/ui';
import flows from './modules/flows';
import repoData from './modules/repoData';
import schemaValidation from './modules/schemaValidation';

export default combineReducers({
  ui,
  flows,
  schemaValidation,
  repoData
})