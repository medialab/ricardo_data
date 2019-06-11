import { combineReducers } from 'redux'
import ui from './modules/ui';
import flows from './modules/flows';
import tables from './modules/tables';
import repoData from './modules/repoData';
import schemaValidation from './modules/schemaValidation';
import modification from './modules/modification';
export default combineReducers({
  ui,
  flows,
  tables,
  schemaValidation,
  modification,
  repoData
})