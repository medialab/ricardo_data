/* eslint-disable no-unused-vars */
import React from 'react';
import {connect} from 'react-redux'

import DataPrep from './containers/DataPrep';
import DataSummary from './containers/DataSummary';
import FileUpload from './containers/FileUpload';
import SchemaValidation from './containers/SchemaValidation';
import Layout from './containers/Layout';
import styles from 'design-workshop/themes/default/style.css';

import { 
  setStep
} from './redux/modules/ui';

const App = ({
  steps,
  selectedStep,
  repoData,
  //actions
  setStep
}) => {
  const renderChildren = () => {
    switch(selectedStep.id) {
      case '0':
      default:
        return <FileUpload />;
      case '1':
        return <SchemaValidation />;
    }
  }
  
  return (
    <div className="App">
      <DataPrep />
      { repoData.datapackage &&
        <Layout 
          steps={steps}
          selectedStep={selectedStep}
          onSetStep={setStep}>
          {renderChildren()}
        </Layout>
      }
    </div>
  );
}


const mapStateToProps = state => ({
  steps: state.ui.steps,
  selectedStep: state.ui.selectedStep,
  repoData: state.repoData
 })
 
 export default connect(mapStateToProps, {
  setStep
 })(App);
