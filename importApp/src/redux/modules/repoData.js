import { get, post } from "axios";
import {
  apiUri,
  branchUri,
  owner,
  referenceUri,
  repoName,
  repoRawContent,
} from "../../config/default";
import { DEFAULT_REF_BRANCH } from "../../constants";

import Octokat from "octokat";

import { Base64 } from "js-base64";
import { unparse } from "papaparse";

import { csvParse } from "d3-dsv";
import { INIT_TABLES } from "./referenceTables";

export const FETCH_TABLE_REQUEST = "FETCH_TABLE_REQUEST";
export const FETCH_TABLE_SUCCESS = "FETCH_TABLE_SUCCESS";
export const FETCH_TABLE_FAILURE = "FETCH_TABLE_FAILURE";

export const FETCH_DATAPACKAGE_REQUEST = "FETCH_DATAPACKAGE_REQUEST";
export const FETCH_DATAPACKAGE_SUCCESS = "FETCH_DATAPACKAGE_SUCCESS";
export const FETCH_DATAPACKAGE_FAILURE = "FETCH_DATAPACKAGE_FAILURE";

export const FETCH_TABLES_REQUEST = "FETCH_TABLES_REQUEST";
export const FETCH_TABLES_SUCCESS = "FETCH_TABLES_SUCCESS";
export const FETCH_TABLES_FAILURE = "FETCH_TABLES_FAILURE";

export const FETCH_BRANCHES_REQUEST = "FETCH_BRANCHES_REQUEST";
export const FETCH_BRANCHES_SUCCESS = "FETCH_BRANCHES_SUCCESS";
export const FETCH_BRANCHES_FAILURE = "FETCH_BRANCHES_FAILURE";

export const CREATE_BRANCH_REQUEST = "CREATE_BRANCH_REQUEST";
export const CREATE_BRANCH_SUCCESS = "CREATE_BRANCH_SUCCESS";
export const CREATE_BRANCH_FAILURE = "CREATE_BRANCH_FAILURE";

export const LOGOUT_USER = "LOGOUT_USER";

export const LOGIN_CREATE_BRANCH_REQUEST = "LOGIN_CREATE_BRANCH_REQUEST";
export const LOGIN_CREATE_BRANCH_SUCCESS = "LOGIN_CREATE_BRANCH_SUCCESS";
export const LOGIN_CREATE_BRANCH_FAILURE = "LOGIN_CREATE_BRANCH_FAILURE";

export const UPDATE_REMOTE_FILES_REQUEST = "UPDATE_REMOTE_FILES_REQUEST";
export const UPDATE_REMOTE_FILES_LOG = "UPDATE_REMOTE_FILES_LOG";
export const UPDATE_REMOTE_FILES_SUCCESS = "UPDATE_REMOTE_FILES_SUCCESS";
export const UPDATE_REMOTE_FILES_FAILURE = "UPDATE_REMOTE_FILES_FAILURE";

const DEFAULT_MESSAGE = "update data";
/**
 * ACTIONS
 */

export const fetchBranches = (payload) => (dispatch) => {
  dispatch({
    type: FETCH_BRANCHES_REQUEST,
    payload,
  });
  return get(`${branchUri}?cb=${Date.now()}`)
    .then((res) => {
      return dispatch({
        type: FETCH_BRANCHES_SUCCESS,
        payload: {
          ...payload,
          branches: res.data,
        },
      });
    })
    .catch((error) =>
      dispatch({
        type: FETCH_BRANCHES_FAILURE,
        payload,
        error,
      })
    );
};

export const fetchTable = (payload) => (dispatch) => {
  const { branch, table } = payload;
  dispatch({
    type: FETCH_TABLE_REQUEST,
    payload,
  });
  return get(`${apiUri}/${table.path}?ref=${branch}?cb=${Date.now()}`)
    .then((res) =>
      dispatch({
        type: FETCH_TABLE_SUCCESS,
        payload: {
          ...payload,
          data: res.data,
        },
      })
    )
    .catch((error) =>
      dispatch({
        type: FETCH_TABLE_FAILURE,
        payload,
        error,
      })
    );
};

export const fetchAllTables = (payload) => (dispatch) => {
  const { branch } = payload;
  // let's get the datapackage from the branch
  dispatch({
    type: FETCH_DATAPACKAGE_REQUEST,
  });
  try {
    get(`${repoRawContent}/${branch}/datapackage.json?cb=${Date.now()}`, {
      responseType: "json",
      responseEncoding: "utf8",
    }).then((res) => {
      const descriptor = res.data;
      const tablesList = descriptor.resources.filter(
        (r) => !r.group && r.name !== "flows"
      );
      dispatch({
        type: FETCH_DATAPACKAGE_SUCCESS,
        payload: descriptor,
      });
      // now we can get tables
      dispatch({
        type: FETCH_TABLES_REQUEST,
      });
      Promise.all(
        tablesList.map((table) => {
          return get(
            //cb param is a cachebuster: we always want last versions
            `${repoRawContent}/${branch}/${table.path}?cb=${Date.now()}`,
            {
              responseType: "text",
              responseEncoding: "utf8",
            }
          ).then((res) => {
            return { ...table, data: res.data };
          });
        })
      )
        .then((res) => {
          let tables = {};
          res.forEach((t) => {
            tables[t.name] = t.data;
          });
          dispatch({
            type: FETCH_TABLES_SUCCESS,
            payload: tables,
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch({
            type: FETCH_TABLES_FAILURE,
            payload,
            error,
          });
        });
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: FETCH_DATAPACKAGE_FAILURE,
      error,
    });
  }
};

export const updateRemoteFiles = (payload) => (dispatch) => {
  dispatch({
    type: UPDATE_REMOTE_FILES_REQUEST,
  });
  const { files, branch, auth, descriptor } = payload;

  const github = new Octokat({
    token: auth.token,
  });

  dispatch(async () => {
    try {
      let repo = await github.repos(owner, repoName).fetch();
      let baseReference = await repo.git.refs(`heads/${branch}`).fetch();
      let flowRessourceMultipart = descriptor.resources.find(
        (r) => r.name === "flows"
      );
      let flowRessourceGroup = descriptor.resources.find(
        (r) => r.group === "flows"
      );
      let treeItems = [];
      for (let file of files) {
        if (!file.sha && file.filePath.includes("flows")) {
          //new file flow ?
          //check if file already exists
          dispatch({
            type: UPDATE_REMOTE_FILES_LOG,
            payload: `downloading existing flows file ${file.filePath}`,
          });
          try {
            const exists = await get(
              `${repoRawContent}/${branch}/${file.filePath}?cb=${Date.now()}`,
              { responseType: "text", responseEncoding: "utf8" }
            );
            if (exists.status === 200) {
              // append new rows at end of the existing file
              file.data = csvParse(exists.data).concat(file.data);
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              // that's a 404 error which is fine
              // it's a new file, add it to the datapackage see issue #70
              if (flowRessourceMultipart) {
                flowRessourceMultipart.path.push(file.filePath);
              } else if (flowRessourceGroup) {
                const newRessource = { ...flowRessourceGroup };
                newRessource.path = file.filePath;
                newRessource.title = file.source;
                descriptor.resources.push(newRessource);
              }
            } else {
              console.log(error);
              dispatch({
                type: UPDATE_REMOTE_FILES_FAILURE,
                error,
              });
              return;
            }
          }
        }
        dispatch({
          type: UPDATE_REMOTE_FILES_LOG,
          payload: `uploading ${file.filePath}`,
        });
        let fileGit = await repo.git.blobs.create({
          // we force one final empty line
          content: Base64.encode(unparse(file.data) + "\r\n"),
          encoding: "base64",
        });
        treeItems.push({
          path: file.filePath,
          sha: fileGit.sha,
          mode: "100644",
          type: "blob",
        });
      }
      // commit new version of the datapackage
      dispatch({
        type: UPDATE_REMOTE_FILES_LOG,
        payload: `uploading datapackage`,
      });
      let fileGit = await repo.git.blobs.create({
        content: Base64.encode(JSON.stringify(descriptor, null, 2)),
        encoding: "base64",
      });
      let filePath = `datapackage.json`;
      treeItems.push({
        path: filePath,
        sha: fileGit.sha,
        mode: "100644",
        type: "blob",
      });
      dispatch({
        type: UPDATE_REMOTE_FILES_LOG,
        payload: `creating tree`,
      });
      let tree = await repo.git.trees.create({
        tree: treeItems,
        base_tree: baseReference.object.sha,
      });
      dispatch({
        type: UPDATE_REMOTE_FILES_LOG,
        payload: `creating commit`,
      });
      let commit = await repo.git.commits.create({
        message: auth.message || DEFAULT_MESSAGE,
        tree: tree.sha,
        parents: [baseReference.object.sha],
      });

      baseReference.update({ sha: commit.sha });
      dispatch({
        type: UPDATE_REMOTE_FILES_SUCCESS,
        payload: commit.sha,
      });
    } catch (err) {
      console.error(err);
      dispatch({
        type: UPDATE_REMOTE_FILES_FAILURE,
        err,
      });
    }
  });
};

export const createBranch = (payload) => (dispatch) => {
  dispatch({
    type: CREATE_BRANCH_REQUEST,
  });

  const { auth, branch, reference } = payload;
  const data = {
    ref: `refs/heads/${branch}`,
    sha: reference.sha,
  };

  return post(referenceUri, data, {
    auth: {
      username: auth.username,
      password: auth.token,
    },
  })
    .then((res) =>
      dispatch({
        type: CREATE_BRANCH_SUCCESS,
        payload: {
          name: auth.username,
          ref: res.data,
        },
      })
    )
    .catch((error) =>
      dispatch({
        type: CREATE_BRANCH_FAILURE,
        error,
      })
    );
};

export const logoutUser = () => ({
  type: LOGOUT_USER,
});

export const loginCreateBranch = (payload) => (dispatch) => {
  dispatch({
    type: LOGIN_CREATE_BRANCH_REQUEST,
    payload,
  });
  const { token } = payload;

  const github = new Octokat({
    token: token,
  });

  dispatch(async () => {
    try {
      let userInfo = await github.user.fetch();
      const username = userInfo.login;
      let repo = await github.repos(owner, repoName).fetch();
      let branches = await repo.branches.fetch();
      let selectedBranch = branches.items.find(
        (branch) => branch.name === username
      );
      if (!selectedBranch) {
        const refBranch = branches.items.find(
          (branch) => branch.name === DEFAULT_REF_BRANCH
        );
        selectedBranch = await repo.git.refs.create({
          ref: `refs/heads/${username}`,
          sha: refBranch.commit.sha,
        });
      }
      dispatch({
        type: LOGIN_CREATE_BRANCH_SUCCESS,
        payload: {
          name: username,
          ref: selectedBranch,
        },
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: LOGIN_CREATE_BRANCH_FAILURE,
        payload: {
          error,
        },
      });
    }
  });
};

/**
 * REDUCER
 */

const initialState = {};

export default function reducer(state = initialState, action) {
  const { payload } = action;
  switch (action.type) {
    case LOGOUT_USER:
      return {
        ...state,
        isLogined: false,
        tables: null,
        selectedBranch: null,
        isBranchCreated: false,
      };
    case INIT_TABLES:
      return {
        ...state,
        tables: null,
        remoteUpdateStatus: null,
      };
    case FETCH_TABLES_SUCCESS:
      return {
        ...state,
        tables: payload,
      };
    case FETCH_TABLES_FAILURE:
      return {
        ...state,
        tables: null,
      };
    case FETCH_DATAPACKAGE_SUCCESS:
      return {
        ...state,
        descriptor: payload,
      };
    case FETCH_BRANCHES_SUCCESS:
      return {
        ...state,
        branches: payload.branches,
      };
    case LOGIN_CREATE_BRANCH_SUCCESS:
      return {
        ...state,
        isLogined: true,
        selectedBranch: payload,
        isBranchCreated: true,
      };
    case LOGIN_CREATE_BRANCH_FAILURE:
      return {
        ...state,
        isLogined: false,
        selectedBranch: null,
        isBranchCreated: false,
      };
    case UPDATE_REMOTE_FILES_REQUEST:
      return {
        ...state,
        remoteUpdateStatus: "loading",
        lastCommit: null,
        remoteUpdateMessage: null,
      };
    case UPDATE_REMOTE_FILES_LOG:
      return {
        ...state,
        remoteUpdateStatus: "loading",
        remoteUpdateMessage: payload,
      };
    case UPDATE_REMOTE_FILES_SUCCESS:
      return {
        ...state,
        remoteUpdateStatus: "updated",
        lastCommit: payload,
      };
    case UPDATE_REMOTE_FILES_FAILURE:
      return {
        ...state,
        remoteUpdateStatus: "fail",
      };
    default:
      return state;
  }
}
