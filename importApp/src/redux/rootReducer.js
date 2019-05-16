import { combineReducers } from 'redux'
import ui from './modules/ui';
import flow from './modules/flow';
import repoData from './modules/repoData';

export default combineReducers({
  ui,
  flow,
  repoData
})