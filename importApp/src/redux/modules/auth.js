import {get} from 'axios';
import {userUri} from '../../config/default';

import {selectBranch} from './repoData';

import {SET_STEP} from './ui';
export const LOGIN_GITHUB_REQUEST = 'LOGIN_GITHUB_REQUEST';
export const LOGIN_GITHUB_SUCCESS = 'LOGIN_GITHUB_SUCCESS';
export const LOGIN_GITHUB_FAILURE = 'LOGIN_GITHUB_FAILURE';

export const loginGithub = (payload) => (dispatch, getState) => {
  dispatch({
    type: LOGIN_GITHUB_REQUEST,
    payload
  })
  const {username, token} = payload;
  const branch = username;
  return get(userUri, {
    auth: {
      username,
      password: token
    }
  })
  .then((res) => {
    dispatch({
      type: LOGIN_GITHUB_SUCCESS,
      payload
    });
    // const {selectedBranch} = getState().repoData;
    dispatch(selectBranch({branch}));
  })
  .catch(err => {
    console.error(err);
    dispatch({
      type: LOGIN_GITHUB_FAILURE
    })
  });
}

/**
 * REDUCER
 */

const initialState = {
  isLogined: false
}

export default function reducer(state = initialState, action){
  const {payload} = action;
  switch (action.type){
    // case SET_STEP:
    //   if (payload.id === '0') {
    //     return initialState
    //   }
    //   return state;
    case LOGIN_GITHUB_SUCCESS:
      return {
        ...state,
        isLogined: true,
        auth: payload
      }
    case LOGIN_GITHUB_FAILURE:
      return {
        ...state,
        isLogined: false,
        auth: null
      }
    default: 
      return state;
  }
}