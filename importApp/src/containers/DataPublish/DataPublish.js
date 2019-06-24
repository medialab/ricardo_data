import React from 'react';
import {connect} from 'react-redux';
import {groupBy, pick} from 'lodash';

import {
  Button,
  Control,
  Field,
  Help
} from 'design-workshop';

import {
  csvParse
} from 'd3-dsv';

import {exportFlows} from '../../redux/modules/flows';

import {updateRemoteFiles} from '../../redux/modules/repoData';

import {downloadFlow, downloadTable} from '../../utils/fileExporter';
import ModificationSummary from '../../components/ModificationSummary';
import GithubAuthModal from '../../components/GithubAuthModal';

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

  render () {
    const {flows, repoData, referenceTables, originalLength} = this.props;
    const {selectedBranch, remoteUpdateStatus} = repoData;
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

    const handleExportFlow = () => {
      const {file, data} = flows;
      downloadFlow(data, file.name, 'csv')
    }
    
    const handleExportTables = async () => {
      updatedTables.forEach((table)=>{
        downloadTable(referenceTables[table.name], table.name, 'csv')
      });
      await new Promise(r => setTimeout(r, 1000))
    }

    const parsedFlows = csvParse(flows.data.map(d => d.join(',')).join('\n'));
    const groupedFlows = groupBy(parsedFlows, (item) => item['source']);


    const handleUpdateRemoteFiles= (auth) => {
      this.handleCloseModal();

      const flowFiles = Object.keys(groupedFlows).map((file) => {
        return {
          fileName: `${file}.csv`,
          data: groupedFlows[file]
        }
      });
      const tableFiles = updatedTables.map((table) => {
        return {
          fileName: `${table.name}.csv`,
          data: referenceTables[table.name],
          sha: repoTables[table.name].sha
        }
      })
      this.props.updateRemoteFiles({
        auth,
        files: flowFiles.concat(tableFiles),
        branch: selectedBranch.name
      })
    }

    return (
      <div>
        <ModificationSummary groupedFlows={groupedFlows} updatedTables={updatedTables} />
        <Field isGrouped>
          <Control>
            <Button isColor="info" onClick={handleExportFlow}>Export fixed flows table</Button>
          </Control>
          <Control>
            <Button isDisabled={!updatedTables.length} isColor="info" onClick={handleExportTables}>Export updated reference tables</Button>
          </Control>
          <Control>
            <Button isColor="info" onClick={this.handleOpenModal}>Publish tables to "{selectedBranch.name}" branch</Button>
          </Control>
        </Field>
        <Field>
          {remoteUpdateStatus === 'loading' && <Help isColor='success'>updating files on github...</Help>}
          {remoteUpdateStatus === 'updated' && <Help isColor='success'>files are updated on github</Help>}
          {remoteUpdateStatus === 'fail' && <Help isColor='danger'>fail to update files on github</Help>}
        </Field>
        <GithubAuthModal 
          isActive={this.state.isModalShow}
          isCommit={true}
          closeModal={this.handleCloseModal}
          onSubmitAuth={handleUpdateRemoteFiles}
        />
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