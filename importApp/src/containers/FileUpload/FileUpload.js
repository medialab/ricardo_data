import React from 'react'
import {connect} from 'react-redux'

import {Button, DropZone} from 'design-workshop'
import { 
  importFlows,
} from '../../redux/modules/flows';

import { 
  setStep
} from '../../redux/modules/ui';

import {
  validateHeader, 
  getSchema
} from '../../redux/modules/schemaValidation';

import HeaderValidation from '../../components/HeaderValidation';

import {parseSheet, parseTable} from '../../utils/fileParser';
import { MAXIMUM_FILE_SIZE } from '../../constants';

const FileUpload = ({
  schema,
  flows,
  headerFeedback,
  setStep,
  importFlows,
  validateHeader
}) => {
  const handleDrop = ([file]) => {
    if (file.name.split('.')[1] === 'xlsx') {
      parseSheet(file)
      .then((data) => {
        importFlows({
          file: {
            name: file.name
          },
          data
        });
        validateHeader({source: data, schema})
      })
      .catch((error) => console.error('fail to parse file'))
    }
    else {
      parseTable(file)
      .then((data) => {
        importFlows({
          file: {
            name: file.name
          },
          data
        });
        validateHeader({source: data, schema})
      })
      .catch((error) => console.error('fail to parse file'))
    }
  }
  const handleDropRejected = (file, event) => {
    console.log("file is invalid")
  }
  const handleNextStep = () => setStep({id: '1'})
  return (
    <div>
      <DropZone
        maxSize={MAXIMUM_FILE_SIZE}
        onDrop={handleDrop}
        onDropRejected={handleDropRejected}
        isSize="small">
        <span className="tech-info">Drag and drop .xlsx, .csv file here(maximum 10MB)</span>
      </DropZone>
      {
        headerFeedback && headerFeedback.status === 'loading' &&
        <span>Validating Headers</span>
      }
      {
        headerFeedback && headerFeedback.valid &&
        <div style={{
          display: 'flex',
          justifyContent: 'space-between'
          }}>
          <span className="has-text-success has-text-weight-bold">Headers of "{flows.file.name}" are valid</span>
          <Button 
            isColor="info" 
            onClick={handleNextStep}>
              Next Step
          </Button>
        </div>
      }
      {
        headerFeedback && !headerFeedback.valid && headerFeedback.type === 'ERROR_HEADER' &&
        <div style={{
          textAlign:'center'
          }}>
          <span className="has-text-danger has-text-weight-bold">Headers of "{flows.file.name}" do not match schema fields, please fix your file and re-upload</span>
          <HeaderValidation 
            headerNames = {headerFeedback.headerNames}
            fieldNames = {headerFeedback.fieldNames}
          />
        </div>
      }
    </div>
  )
}


const mapStateToProps = state => ({
  schema: state.schemaValidation.descriptor && getSchema(state),
  flows: state.flows,
  headerFeedback: state.schemaValidation.headerFeedback
 })
 
 export default connect(mapStateToProps, {
  importFlows,
  setStep,
  validateHeader
 })(FileUpload);
