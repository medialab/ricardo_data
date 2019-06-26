import React from 'react';
import {connect} from 'react-redux'

import {
  Button,
  Help,
  Select
} from 'design-workshop';

import { 
  fetchAllTables,
  fetchDatapackage
} from '../../redux/modules/repoData';

import {loginCreateBranch} from '../../redux/modules/repoData';

import GithubAuthModal from '../../components/GithubAuthModal';


class DataPrep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalShow: false 
    }
  }
  componentDidMount() {
    this.props.fetchDatapackage()
  }
   
  handleShowLogin =()=> {
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
    this.props.loginCreateBranch(payload);
    this.handleCloseModal()
  }

  renderFetchTable() {
    const {repoData} = this.props;
    const {selectedBranch, tables, isBranchCreated} = repoData;

    const handleGetTables = () => {
      this.props.fetchAllTables({branch: selectedBranch.name});
    }

    return (
      <div>
        {isBranchCreated ? 
          <Help isColor="success">branch "{selectedBranch.name}" is created</Help> : 
          <Help isColor="danger">could not get branch from github, try login again</Help>
        }
        {
          selectedBranch && !tables &&
          <Button isColor="info" onClick={handleGetTables}>Fetch table from branch {selectedBranch.name}</Button>
        }
        {selectedBranch && (tables ?
          <Help isColor="success">tables from {selectedBranch.name} branch are loaded</Help>:
          <Help isColor="danger">tables are not loaded, please reload from {selectedBranch.name} branch</Help>)
        }
      </div>
    )
  }

  render () {
    const {repoData} = this.props;
    const {selectedBranch} = repoData;
  
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
            <span>Login to get branch</span>
          </Button>
          {selectedBranch && this.renderFetchTable()}
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
 auth: state.auth.auth
})

export default connect(mapStateToProps, {
  loginCreateBranch,
  fetchAllTables,
  fetchDatapackage
})(DataPrep);