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

  render () {
    const {flows, repoData, referenceTables, originalLength} = this.props;
    const {selectedBranch, remoteFilesUpdated, remoteReponse} = repoData;
    const repoTables = repoData.tables;
    const status = remoteReponse.map((response) => {
      if (response.error) {
        return {
          requestSuccess: false,
          statusText: response.error.response.statusText,
          url: response.error.config.url,
          message: response.error.response.data.message 
        }
        // return pick(response.error.response, ['data', 'status', 'statusText'])
      } else {
        return {
          requestSuccess: true,
          url: response.config.url
        }
        // return pick(response, ['data', 'status', 'statusText'])
      }
    })

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
            <Button isColor="info" onClick={handleExport}>Export fixed flows table</Button>
          </Control>
          <Control style={{}}>
            <Button isColor="info" onClick={this.handleOpenModal}>Publish tables to "{selectedBranch.name}" branch</Button>
          </Control>
        </Field>
        <Field>
          {remoteFilesUpdated && status.map((d) => {
              return(
                d.requestSuccess ? 
                <Help isColor='success'>{d.url}</Help> :
                <Help isColor='danger'>{d.url} - {d.statusText} - {d.message}</Help>
              )
          }) }
        </Field>
        <LoginModal isActive={this.state.isModalShow} closeModal={this.handleCloseModal} onSubmitLogin={handleUpdateRemoteFiles} />
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