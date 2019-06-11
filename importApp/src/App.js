/* eslint-disable no-unused-vars */
import React from 'react';
import {connect} from 'react-redux'

import DataModification from './containers/DataModification';
import DataPublish from './containers/DataPublish';
import FileUpload from './containers/FileUpload';

import ConfirmationModal from './components/ConfirmationModal';

import SchemaValidation from './containers/SchemaValidation';
import Layout from './containers/Layout';

import {downloadFile} from './utils/fileExporter';

import styles from 'design-workshop/themes/default/style.css';
import './App.css';

import { 
  setStep,
  showModal,
  hideModal
} from './redux/modules/ui';

import { initTables } from './redux/modules/tables';

const App = ({
  steps,
  isModalDisplay,
  selectedStep,
  repoData,
  flows,
  modificationList,
  //actions
  initTables,
  setStep,
  showModal,
  hideModal
}) => {

  const renderChildren = () => {
    switch(selectedStep.id) {
      case '0':
      default:
        return <FileUpload />;
      case '1':
        return <SchemaValidation />;
      case '2':
        return <DataModification />;
      case '3':
        return <DataPublish />;
    }
  }
  const handleExport = () => {
    const {file, data} = flows;
    downloadFile(data, file.name, 'xlsx')
  }

  const handleSetStep = (step) => {
    let fixed
    if (modificationList) {
      fixed = modificationList.filter((item) => item.fixed)
    }
    if(fixed && step.id === '0') showModal();
    else setStep(step)
  }

  const handleDiscard = () => {
    initTables(repoData.tables);
    setStep(steps[0]);
  }
  
  return (
    <div className="App">
      <Layout 
        steps={steps}
        selectedStep={selectedStep}
        onSetStep={handleSetStep}>
        {renderChildren()}
      </Layout>
      <ConfirmationModal 
        isActive={isModalDisplay}
        onSelectDiscard={handleDiscard}
        onSelectDownload={handleExport}
        closeModal={hideModal} />
    </div>
  );
}


const mapStateToProps = state => ({
  steps: state.ui.steps,
  isModalDisplay: state.ui.isModalDisplay,
  flows: state.flows,
  selectedStep: state.ui.selectedStep,
  modificationList: state.modification.modificationList,
  repoData: state.repoData
 })
 
 export default connect(mapStateToProps, {
  initTables,
  showModal,
  hideModal,
  setStep
 })(App);
