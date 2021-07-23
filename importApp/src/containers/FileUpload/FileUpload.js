import React from 'react'
import {connect} from 'react-redux'
import {findIndex} from 'lodash';

import {Button, DropZone} from 'design-workshop'
import { 
  importFlows,
} from '../../redux/modules/flows';

import { 
  setStep
} from '../../redux/modules/ui';

import {
  validateHeader, 
  getResourceSchema
} from '../../redux/modules/schemaValidation';

import DataPrep from '../DataPrep';

import HeaderValidation from '../../components/HeaderValidation';

import {parseSheet, parseTable} from '../../utils/fileParser';
import { MAXIMUM_FILE_SIZE } from '../../constants';

const prepareFlowData = (data, schema) => {
  // lower foreignKeys
  const FKFieldsIndices = schema.foreignKeys.map(fk => Array.isArray(fk.fields) ? fk.fields : [fk.fields]).reduce((set, fields) => {
    //unique map results
    fields.forEach(f => {
      // hardcoded exception...
      if (f !== 'source') {
        const i = data[0].indexOf(f)
        if (!set.includes(i))
          set.push(i);
        };
      }
    );
    return set;
  }, []);

  // lowercase Reporting and partner + strip
 return data.map( (d,i) => {
    if (i !== 0) {
      return d.map( (v,i) => {
        // Foreign Key fields are forced lowercase and trimed to limit glue work
        if (FKFieldsIndices.includes(i) && v.toLowerCase)
          return v.toLowerCase().trim();
        else
          return v;
      })
    }
    else // don't touch headers..
      return d
  })
}

const FileUpload = ({
  steps,
  selectedStep,
  schema,
  tables,
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
        data = prepareFlowData(data, schema);
        importFlows({
          file: {
            name: file.name.split('.')[0]
          },
          data
        });
        validateHeader({source: data, schema})
      })
      .catch((error) => {
        console.error(error)
        console.error('fail to parse file')
      })
    }
    else {
      parseTable(file)
      .then((data) => {
        data = prepareFlowData(data, schema);
        importFlows({
          file: {
            name: file.name
          },
          data
        });
        validateHeader({source: data, schema})
      })
      .catch((error) => {
        console.error(error)
        console.error('fail to parse file')
      })
    }
  }
  const handleDropRejected = (file, event) => {
    console.log("file is invalid")
  }
  const handleNextStep = () => {
    const currentIndex = findIndex(steps, selectedStep);
    setStep(steps[currentIndex+1])
  }
  return (
    <div>
      <DataPrep />
      {
        tables &&
        <DropZone
          maxSize={MAXIMUM_FILE_SIZE}
          onDrop={handleDrop}
          onDropRejected={handleDropRejected}
          isSize="small">
          <span className="tech-info">Cick here to upload or drag and drop .xlsx, .csv file here(maximum 10MB)</span>
        </DropZone>
      }
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
  steps: state.ui.steps,
  selectedStep: state.ui.selectedStep,
  schema: state.repoData.descriptor && getResourceSchema(state),
  flows: state.flows,
  tables: state.repoData.tables,
  headerFeedback: state.schemaValidation.headerFeedback
 })
 
 export default connect(mapStateToProps, {
  importFlows,
  setStep,
  validateHeader
 })(FileUpload);
