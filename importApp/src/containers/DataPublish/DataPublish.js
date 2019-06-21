import React from 'react';
import {connect} from 'react-redux';
import {
  Button,
  Control,
  Field,
} from 'design-workshop';

import {exportFlows} from '../../redux/modules/flows';

import {updateRemoteFile} from '../../redux/modules/repoData';

import {downloadFile} from '../../utils/fileExporter';
import ModificationSummary from '../../components/ModificationSummary';
import LoginModal from '../../components/LoginModal';

class DataPublish extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalShow: false 
    }
  }

  handleUpdateRemoteFile = () => {
    this.setState({isModalShow: true})
  }

  handleCloseModal = () => {
    this.setState({isModalShow: false})
  }

  handleAuthenticate = (auth) => {
    const {flows, tables, repoData} = this.props;
   
  }

  render () {
    const {flows, tables, repoData} = this.props;
    const {selectedBranch} = repoData;
    const handleExport = () => {
      const {file, data} = flows;
      downloadFile(data, file.name, 'xlsx')
    }
    
    return (
      <div>
        <ModificationSummary referenceTables={tables} />
        <p>and update tables to "{selectedBranch.name}" branch</p>
        <Field isGrouped>
          <Control>
            <Button isColor="info" onClick={handleExport}>Export fixed flows table</Button>
          </Control>
          <Control>
            <Button isColor="info" onClick={this.handleUpdateRemoteFile}>Publish tables to Github</Button>
          </Control>
        </Field>
        <LoginModal isActive={this.state.isModalShow} closeModal={this.handleCloseModal} onSubmitLogin={this.handleAuthenticate}/>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  flows: state.flows,
  tables: state.tables,
  repoData: state.repoData
})

export default connect(mapStateToProps, {
  exportFlows,
  updateRemoteFile
})(DataPublish);