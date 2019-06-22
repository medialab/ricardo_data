import React from 'react';
import {connect} from 'react-redux';
import {groupBy} from 'lodash';

import {
  Button,
  Control,
  Field,
} from 'design-workshop';

import {
  csvParse
} from 'd3-dsv';

import {exportFlows} from '../../redux/modules/flows';

import {updateRemoteFiles} from '../../redux/modules/repoData';

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

  handleOpenModal = () => {
    this.setState({isModalShow: true})
  }

  handleCloseModal = () => {
    this.setState({isModalShow: false})
  }

  // handleUpdateRemoteFiles= (auth) => {
  //   const {flows, tables, repoData} = this.props;
  //   const repoTables = repoData.tables;
  //   console.log(repoTables);
  // }

  render () {
    const {flows, refereceTables, repoData, referenceTables, originalLength} = this.props;
    const {selectedBranch} = repoData;
    const repoTables = repoData.tables;

    let updatedTables = [];

    Object.keys(referenceTables).forEach((name) => {
      if (referenceTables[name].length !== originalLength[name]) {
        updatedTables.push({
          name,
          updatedRows: referenceTables[name].slice(originalLength[name])
        })
      }
    });

    const handleExport = () => {
      const {file, data} = flows;
      downloadFile(data, file.name, 'xlsx')
    }
    const parsedFlows = csvParse(flows.data.map(d => d.join(',')).join('\n'));
    const groupedFlows = groupBy(parsedFlows, (item) => item['source']);

    const handleUpdateRemoteFiles = () => {
      console.log(updatedTables);
    }

    return (
      <div>
        <ModificationSummary groupedFlows={groupedFlows} updatedTables={updatedTables} />
        <Field isGrouped>
          <Control>
            <Button isColor="info" onClick={handleExport}>Export fixed flows table</Button>
          </Control>
          <Control>
            <Button isColor="info" onClick={this.handleOpenModal}>Publish tables to "{selectedBranch.name}" branch</Button>
          </Control>
        </Field>
        <LoginModal isActive={this.state.isModalShow} closeModal={this.handleCloseModal} onSubmitLogin={handleUpdateRemoteFiles}/>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  flows: state.flows,
  referenceTables: state.referenceTables.referenceTables,
  originalLength: state.referenceTables.originalLength,
  repoData: state.repoData
})

export default connect(mapStateToProps, {
  exportFlows,
  updateRemoteFiles
})(DataPublish);