import { combineReducers } from 'redux'
import ui from './modules/ui';
import flows from './modules/flows';
import repoData from './modules/repoData';

export default combineReducers({
  ui,
  flows,
  repoData
})