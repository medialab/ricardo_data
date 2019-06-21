import { combineReducers } from 'redux'
import ui from './modules/ui';
import auth from './modules/auth';
import flows from './modules/flows';
import tables from './modules/tables';
import repoData from './modules/repoData';
import schemaValidation from './modules/schemaValidation';
import modification from './modules/modification';
export default combineReducers({
  ui,
  auth,
  flows,
  tables,
  schemaValidation,
  modification,
  repoData
})