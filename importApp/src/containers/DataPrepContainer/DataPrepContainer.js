import React from 'react';
import { connect } from 'react-redux'

import { 
  fetchAllTables,
  fetchDatapackage
} from '../../redux/modules/repoData';

class DataPrepContainer extends React.Component {
  componentDidMount() {
    this.props.fetchAllTables({branch: 'master'})
    this.props.fetchDatapackage()
  }

  render () {
    const {repoData} = this.props
    return (
      <div>
        {repoData.tables && <span>tables</span>}
        {repoData.datapackage && <span>datapackage</span>}
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
})(DataPrepContainer);