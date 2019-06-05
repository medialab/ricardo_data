import React from 'react';
import {connect} from 'react-redux'

class DataPublish extends React.Component {

  render () {
    return (
      <div>
        github publish
      </div>
    )
  }
}

const mapStateToProps = state => ({
 repoData: state.repoData
})

export default connect(mapStateToProps)(DataPublish);