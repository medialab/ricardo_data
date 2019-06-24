import React from 'react';
import {connect} from 'react-redux'

import {
  Button,
  Help,
  Select
} from 'design-workshop';

import { 
  selectBranch,
  createBranch,
  fetchBranches,
  fetchAllTables,
  fetchDatapackage
} from '../../redux/modules/repoData';

import {loginGithub} from '../../redux/modules/auth';
import GithubAuthModal from '../../components/GithubAuthModal';


class DataPrep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalShow: false 
    }
  }
  componentDidMount() {
    // const {repoData} = this.props
    // if (!repoData.tables && !repoData.datapackage) {
    //   this.props.fetchDatapackage()
    //   this.props.fetchAllTables({branch:'master'})
    // }
    this.props.fetchDatapackage()
  }
   
  handleShowLogin =()=> {
    this.props.fetchBranches()
    this.setState({
      isModalShow: true
    })
  }

  handleCloseModal = () => {
    this.setState({
      isModalShow: false
    })
  }
   
  handleLogin = (payload) => {
    this.props.loginGithub(payload);
    this.handleCloseModal()
  }

  handleCreateBranch = () => {
    const {auth, repoData} = this.props;
    const {branches, branchToCreated} = repoData;
    // TODO: hardcoded
    const refBranch = branches.find((branch) => branch.name === 'master');
    if (refBranch) {
      this.props.createBranch({
        branch: branchToCreated,
        auth,
        reference: {
          sha: refBranch.commit.sha
        }
      })
    }
  }
  renderFetchTable() {
    const {repoData, auth} = this.props;
    const {selectedBranch, branchToCreated, tables, isBranchCreated} = repoData;

    const handleGetTables = () => {
      this.props.fetchAllTables({branch: selectedBranch.name});
    }

    return (
      <div>
        {branchToCreated &&
          <div>
            <Help isColor="danger">No previous working branch</Help>
            <Button isColor="info" onClick={this.handleCreateBranch}>Create a new branch</Button>
          </div>
        }
        {isBranchCreated ? 
          <Help isColor="success">branch "{selectedBranch.name}" is created</Help> : 
          <Help isColor="danger">could not create branch "{branchToCreated}"</Help>
        }
        {
          selectedBranch && !tables &&
          <Button isColor="info" onClick={handleGetTables}>Fetch table from branch {selectedBranch.name}</Button>
        }
        {selectedBranch && (tables ?
          <Help isColor="success">tables from {selectedBranch.name} branch are loaded</Help>:
          <Help isColor="danger">tables from {selectedBranch.name} branch are not loaded</Help>)
        }
      </div>
    )
  }

  render () {
    const {repoData, isLogined} = this.props;
    const {branches, selectedBranch, tables} = repoData;
  
    return (
      <div>
        {/* <Label>Get tables from {selectedBranch.name} branch</Label>
          <Select value={selectedBranch} onChange={handleSelectBranch}>
            {
              branches.map((item, index) => {
                return (
                  <option key={index}>{item.name}</option>
                )
              })
            }
          </Select>
          <Button isColor="info" onClick={handleGetTables}>Fetch</Button> */}
          <Button isColor="info" onClick={this.handleShowLogin}>
            <span>{isLogined ? "Re-Login" : "Login"} to get branch</span>
          </Button>
          {isLogined ? 
            <Help isColor="success">you are logined</Help> :
            <Help isColor="danger">you are  not logined</Help> 
          }
          {isLogined && this.renderFetchTable()}
          <GithubAuthModal 
            isActive={this.state.isModalShow}
            isCommit={false}
            closeModal={this.handleCloseModal} 
            onSubmitAuth={this.handleLogin} />
      </div>
    )
  }
}

const mapStateToProps = state => ({
 repoData: state.repoData,
 isLogined: state.auth.isLogined,
 auth: state.auth.auth
})

export default connect(mapStateToProps, {
  loginGithub,
  fetchBranches,
  createBranch,
  selectBranch,
  fetchAllTables,
  fetchDatapackage
})(DataPrep);