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
import LoginModal from '../../components/LoginModal';


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
    const {repoData, auth, isLogined} = this.props;
    const {selectedBranch, branchToCreated, tables} = repoData;

    const handleGetTables = () => {
      this.props.fetchAllTables({branch: selectedBranch.name});
    }

    return (
      <div>
        <p>you are logined</p>
        {branchToCreated &&
          <div>
            <p>No previous working branch</p>
            <Button onClick={this.handleCreateBranch}>Create a new branch</Button>
          </div>
        }
        {
          selectedBranch && !tables &&
          <Button isColor="info" onClick={handleGetTables}>Fetch table from branch {selectedBranch.name}</Button>
        }
      </div>
    )
  }

  render () {
    const {repoData, isLogined} = this.props;
    const {branches, selectedBranch, tables} = repoData;
  
    return (
      <div>
        {/* <Label>Get tables from {selectedBranch} branch</Label>
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
          <Button onClick={this.handleShowLogin}>
            <span>{isLogined ? "Re-Login" : "Login"} to get branch</span>
          </Button>
          {isLogined && this.renderFetchTable()}
          {tables &&
            <p className="has-text-success">tables from {selectedBranch.name} branch are loaded</p>
          }
          <LoginModal isActive={this.state.isModalShow} closeModal={this.handleCloseModal} onSubmitLogin={this.handleLogin}/>
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