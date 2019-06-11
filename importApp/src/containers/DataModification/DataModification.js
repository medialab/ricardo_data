import React from 'react';
import {connect} from 'react-redux';


import {
  Button,
} from 'design-workshop';

import {
  setStep,
  hideModification,
  selectError,
  goNextError,
  goPrevError
} from '../../redux/modules/ui';

import {updateFlows} from '../../redux/modules/flows';

import {submitModification} from '../../redux/modules/modification';

import SummaryTable from '../../components/SummaryTable';
import ModificationComponent from './ModificationComponent';

import {getResourceSchema} from '../../redux/modules/schemaValidation';

class DataModification extends React.Component {
  
  render() {
    const {flows, schema, isModification, modificationIndex, modificationList} = this.props;
    const nonFixedList = modificationList.filter((item) => item.fixed === false)

    const handlePrevStep = () => this.props.setStep({id: '1'})
    const handleNextStep = () => this.props.setStep({id: '3'})

    const handlePrevError = () => {
      if (modificationIndex > 0) this.props.goPrevError();
    }

    const handleNextError = () => {
      if (modificationIndex < modificationList.length - 1) this.props.goNextError();
    }

    const handleSelectError = (index) => {
      if (index < modificationList.length) {
        this.props.selectError({
          index
        })
      }
    }

    const handleSelectFirstError = () => {
      this.props.selectError({
        index: nonFixedList[0].index
      })
    }

    const handleSubmitModification = (payload) => {
      const {index} = payload;
      this.props.submitModification(payload);
      this.props.updateFlows(payload);
      if ( index+1 < modificationList.length && nonFixedList.length > 0) {
        handleSelectError(index+1)
      }
      else {
        this.props.hideModification()
      }
    }
    return (
      <div>
        {
          !isModification &&
            <div>
              {
                modificationList.length > 0 &&
                <div className="has-text-danger has-text-weight-bold">{modificationList.length} different errors need to modify</div>
              }
              {
                modificationList && 
                <SummaryTable modificationList={modificationList} onSelectError={handleSelectError} />
              }
              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <Button 
                  isColor="info" 
                  onClick={handlePrevStep}>
                    Previous Step
                </Button>
                {
                  nonFixedList.length === 0 ?
                    <Button isColor="info" onClick={handleNextStep}>
                      Ready to publish
                    </Button> :
                    <Button isColor="info" onClick={handleSelectFirstError}>
                      Start fix error
                    </Button>
                }
              </div>
            </div>
        }
        {
          isModification &&
          <div>
            <ModificationComponent 
              flows={flows}
              schema={schema}
              modificationIndex={modificationIndex}
              modificationItem={modificationList[modificationIndex]} 
              onSubmitModification={handleSubmitModification} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div>
                <Button isColor="info" onClick={this.props.hideModification}>
                  Back to summary
                </Button>
              </div>
              <span className="has-text-danger has-text-weight-bold">{modificationIndex + 1} / {modificationList.length }</span>
              <div>
                {
                  modificationIndex !==0 &&
                    <Button isColor="info" style={{marginLeft: '10px'}}
                      onClick={handlePrevError}>
                      Prev Error
                    </Button>
                }
                {
                  modificationIndex !== (modificationList.length-1) &&
                    <Button isColor="info" style={{marginLeft: '10px'}}
                      onClick={handleNextError}>
                      Next Error
                    </Button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  flows: state.flows.data,
  schema: getResourceSchema(state),
  schemaFeedback: state.schemaValidation.schemaFeedback,
  modificationList: state.modification.modificationList,
  isModification: state.ui.isModification,
  modificationIndex: state.modification.modificationIndex
})

export default connect(mapStateToProps, {
  setStep,
  updateFlows,
  hideModification,
  selectError,
  goNextError,
  goPrevError,
  submitModification
})(DataModification);