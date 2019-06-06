import React from 'react';
import {connect} from 'react-redux';
import {
  Button,
} from 'design-workshop';

import {exportFlows} from '../../redux/modules/flows';
import {downloadFile} from '../../utils/fileExporter';

class DataPublish extends React.Component {

  render () {
    const handleExport = () => {
      const {file, data} = this.props.flows;
      downloadFile(data, file.name, 'xlsx')
    }
    return (
      <div>
        <Button onClick={handleExport}>Export fixed data</Button>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  flows: state.flows
})

export default connect(mapStateToProps, {exportFlows})(DataPublish);