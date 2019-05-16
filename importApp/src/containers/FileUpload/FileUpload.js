import React from 'react'
import {connect} from 'react-redux'

import {DropZone} from 'design-workshop'
import { 
  updateFlow
} from '../../redux/modules/flow';

const FileUpload = () => {
  const handleDropFile = (file) => console.log(file)
  return (
    <DropZone>
      <span className="tech-info">Drag and drop .xlsx, .csv file here</span>
    </DropZone>
  )
}


const mapStateToProps = state => ({
  flow: state.flow
 })
 
 export default connect(mapStateToProps, {
  updateFlow
 })(FileUpload);
