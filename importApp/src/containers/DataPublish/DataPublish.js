/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import {connect} from 'react-redux';
import {groupBy, pick} from 'lodash';

import {
  Button,
  Control,
  Field,
  Columns,
  Column,
  Help
} from 'design-workshop';

import {
  csvParse
} from 'd3-dsv';

import {exportFlows} from '../../redux/modules/flows';
import {setStep} from '../../redux/modules/ui';

import {updateRemoteFiles} from '../../redux/modules/repoData';

import {downloadFlow, downloadTable} from '../../utils/fileExporter';
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
      downloadFlow(data, `${file.name}_corrections`, 'csv')
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
    const handleStartOver = () => {
      this.props.setStep({id: '0'})
    }

    return (
      <div>
        <Columns>
          <Column>
            <strong>fixed flows table by source</strong>
            {
              Object.keys(groupedFlows).map((source) => {
                return (
                  <p>{source}.csv</p>
                )
              })
            }
          </Column>
          <Column>
            <div>
              <strong>updated reference tables</strong>
              {
                updatedTables.map((table)=>{
                  const handleExportTable = () => {
                    downloadTable(referenceTables[table.name], table.name, 'csv')
                  }
                  return (
                    <Control>
                      <a href="#" onClick={handleExportTable}>{table.name} table: {table.updatedRows.length} rows added</a>
                    </Control>
                  )
                })
              }
            </div>
          </Column>
        </Columns>
        <Field isGrouped>
          <Control>
            <Button isColor="info" onClick={handleExportFlow}>Download fixed flows</Button>
          </Control>
          <Control>
            {
              remoteUpdateStatus === 'updated' ? 
              <Button isColor='success' onClick={handleStartOver}>Start a new import</Button> :
              <Button isDisabled={remoteUpdateStatus === 'loading'} isColor="info" onClick={this.handleOpenModal}>Publish tables to "{selectedBranch.name}" branch</Button>
            }
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
  setStep,
  exportFlows,
  updateRemoteFiles
})(DataPublish);