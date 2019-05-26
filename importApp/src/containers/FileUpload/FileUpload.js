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

const FileUpload = ({
  schema,
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
  const handleNextStep = () => setStep({id: '1'})
  return (
    <div>
      <DropZone
        maxSize={10000000}
        onDrop={handleDrop}
        isSize="small">
        <span className="tech-info">Drag and drop .xlsx, .csv file here</span>
      </DropZone>
      {
        headerFeedback && headerFeedback.status === 'loading' &&
        <span>validating fields</span>
      }
      {
        headerFeedback && headerFeedback.valid &&
        <div>
          <span>data fields are valid</span>
          <Button 
            isColor="info" 
            onClick={handleNextStep}>
              Next Step
          </Button>
        </div>
      }
      {
        headerFeedback && !headerFeedback.valid && headerFeedback.type === 'ERROR_HEADER' &&
        <div>
          <span className="has-text-danger has-text-weight-bold">Fields are invalid, plase fix your file and re-upload</span>
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
  headerFeedback: state.schemaValidation.headerFeedback
 })
 
 export default connect(mapStateToProps, {
  importFlows,
  setStep,
  validateHeader
 })(FileUpload);
