import React from 'react';
import {connect} from 'react-redux'

import {
  Label,
  Button,
  Help,
  Select
} from 'design-workshop';

import { 
  selectBranch,
  fetchBranches,
  fetchAllTables,
  fetchDatapackage
} from '../../redux/modules/repoData';

class DataPrep extends React.Component {
  componentDidMount() {
    // const {repoData} = this.props
    // if (!repoData.tables && !repoData.datapackage) {
    //   this.props.fetchDatapackage()
    //   this.props.fetchAllTables({branch:'master'})
    // }
    this.props.fetchDatapackage()
    this.props.fetchBranches()
  }  

  render () {
    const {repoData} = this.props;
    const {branches, selectedBranch, tables} = repoData;
    const handleSelectBranch = (event) => {
      this.props.selectBranch({
        branch: event.target.value
      })
    }
    const handleGetTables = () => {
      this.props.fetchAllTables({branch: selectedBranch});
    }
    return (
      <div>
        {branches && 
          <div>
            <Label>Get tables from {selectedBranch} branch</Label>
            <Select value={selectedBranch} onChange={handleSelectBranch}>
              {
                branches.map((item, index) => {
                  return (
                    <option key={index}>{item.name}</option>
                  )
                })
              }
            </Select>
            <Button isColor="info" onClick={handleGetTables}>Fetch</Button>
            {tables &&
              <Help isColor="success">tables from {selectedBranch} branch are loaded</Help>
            }
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
 repoData: state.repoData
})

export default connect(mapStateToProps, {
  fetchBranches,
  selectBranch,
  fetchAllTables,
  fetchDatapackage
})(DataPrep);