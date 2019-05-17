import React from 'react'
import {connect} from 'react-redux'

import {DropZone} from 'design-workshop'
import { 
  importFlows,
} from '../../redux/modules/flows';

import { 
  setStep
} from '../../redux/modules/ui';

import {parseSheet, parseTable} from '../../utils/fileParser';

const FileUpload = ({
  setStep,
  importFlows
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
        setStep({id: '1'});
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
        setStep({id: '1'});
      })
      .catch((error) => console.error('fail to parse file'))
    }
  }
  return (
    <DropZone
      maxSize={10000000}
      onDrop={handleDrop}>
      <span className="tech-info">Drag and drop .xlsx, .csv file here</span>
    </DropZone>
  )
}


const mapStateToProps = state => ({
  flow: state.flow
 })
 
 export default connect(mapStateToProps, {
  importFlows,
  setStep
 })(FileUpload);
