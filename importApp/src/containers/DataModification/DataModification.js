import React from 'react';
import {connect} from 'react-redux';

import {groupBy, sortBy, values} from 'lodash';

import {
  Button,
} from 'design-workshop';

import {RANKED_FIELDS} from '../../constants';
import {
  setStep,
  showModification, 
  hideModification,
  selectError,
  goNextError,
  goPrevError
} from '../../redux/modules/ui';
import SummaryTable from '../../components/SummaryTable';
import ModificationComponent from './ModificationComponent';

import {getSchema} from '../../redux/modules/schemaValidation';

class DataModification extends React.Component {
  
  render() {
    const {flows, schema, schemaFeedback, isModification, modificationIndex} = this.props;
    const re = /row\s\d*/;

    let orderedErrors;
    if (schemaFeedback.collectedErrors) {
      const errorsList = values(schemaFeedback.collectedErrors).reduce((res, item) => {
        return res.concat(item.errors)
      },[])
      const groupedErrorsList = values(groupBy(errorsList, (v) => v.field + v.value))
                                .map((errors)=> {
                                  return {
                                    field: errors[0].field,
                                    errorType: errors[0].errorType,
                                    message: errors[0].message.replace(re, `${errors.length} rows`),
                                    value: errors[0].value,
                                    errors
                                  }
                                })
      orderedErrors = sortBy(groupedErrorsList, (field) => {
        return RANKED_FIELDS[field.name]
      });
    }
    const handlePrevStep = () => this.props.setStep({id: '1'})

    const handlePrevError = () => {
      if (modificationIndex > 0) this.props.goPrevError();
    }

    const handleNextError = () => {
      if (modificationIndex < orderedErrors.length - 1) this.props.goNextError();
    }
    const handleSelectError = (index) => {
      this.props.selectError({
        index
      })
    }
    return (
      <div>
        {
          !isModification &&
            <div>
              {
                orderedErrors.length > 0 &&
                <div className="has-text-danger has-text-weight-bold">{orderedErrors.length} different errors need to modify</div>
              }
              {
                orderedErrors && 
                <SummaryTable groupedErrors={orderedErrors} onSelectError={handleSelectError} />
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

                <Button isColor="info" onClick={this.props.showModification}>
                  Start fix error
                </Button>
              </div>
            </div>
        }
        {
          isModification &&
          <div>
            <ModificationComponent 
              flows={flows}
              schema={schema}
              modificationItem={orderedErrors[modificationIndex]} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div>
                <Button isColor="info" onClick={this.props.hideModification}>
                  Back to summary
                </Button>
              </div>
              <span className="has-text-danger has-text-weight-bold">{modificationIndex + 1} / {orderedErrors.length }</span>
              <div>
                {
                  modificationIndex !==0 &&
                    <Button isColor="info" style={{marginLeft: '10px'}}
                      onClick={handlePrevError}>
                      Prev Error
                    </Button>
                }
                {
                  modificationIndex !== (orderedErrors.length-1) &&
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
  schema: state.schemaValidation.descriptor && getSchema(state),
  schemaFeedback: state.schemaValidation.schemaFeedback,
  isModification: state.ui.isModification,
  modificationIndex: state.ui.modificationIndex
})

export default connect(mapStateToProps, {
  setStep,
  showModification,
  hideModification,
  selectError,
  goNextError,
  goPrevError
})(DataModification);