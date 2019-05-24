import React from 'react';
import {connect} from 'react-redux'

import { 
  fetchAllTables,
  fetchDatapackage
} from '../../redux/modules/repoData';

class DataPrep extends React.Component {
  componentDidMount() {
    this.props.fetchDatapackage()
    this.props.fetchAllTables({branch:'master'})
  }

  render () {
    const {repoData} = this.props
    return (
      <div>
        {!repoData.tables && <span>loading tables</span>}
        {!repoData.datapackage && <span>loading datapackage</span>}
      </div>
    )
  }
}

const mapStateToProps = state => ({
 repoData: state.repoData
})

export default connect(mapStateToProps, {
  fetchAllTables,
  fetchDatapackage
})(DataPrep);