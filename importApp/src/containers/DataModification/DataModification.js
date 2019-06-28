import React from 'react';
import {connect} from 'react-redux';
import {uniq, findIndex} from 'lodash';

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
import {revalidateRows} from '../../redux/modules/schemaValidation';
import {submitModification} from '../../redux/modules/modification';
import {getResourceSchema} from '../../redux/modules/schemaValidation';
import {addTableRow, deleteTableRow} from '../../redux/modules/referenceTables';

import SummaryTable from '../../components/SummaryTable';
import ModificationComponent from './ModificationComponent';
import AlertModal from '../../components/AlertModal';

class DataModification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: false,
      isModificationTouched: false
    }
  }

  handleTouchModification = (touched) => {
    this.setState({
      isModificationTouched: touched
    })
  }

  handleShowAlert = () => {
    this.setState({
      showAlert: true
    })
  }

  handleHideAlert = () => {
    this.setState({
      showAlert: false
    })
  }
  
  render() {
    const {flows, schema, isModification, modificationIndex, modificationList, referenceTables, steps, selectedStep} = this.props;
    const nonFixedList = modificationList.filter((item) => item.fixed === false);
    const yearFormatValues = modificationList
                            .filter((item)=> item.field === 'year' && !item.fixed)
                            .map((item) => ''+item.value);

    const modificationItem = modificationList[modificationIndex]
    let isCurrencyFixDisabled = false;
    if (modificationItem.field === 'currency|year|reporting' && yearFormatValues.indexOf(modificationItem.value.split('|')[1]) !== -1) {
      isCurrencyFixDisabled = true
    }
    
    const handlePrevStep = () => {
      const currentIndex = findIndex(steps, selectedStep)
      this.props.setStep(steps[currentIndex-1])
    }
    const handleNextStep = () =>  {
      const currentIndex = findIndex(steps, selectedStep)
      this.props.setStep(steps[currentIndex+1])
    }

    const handlePrevError = () => {
      if (this.state.isModificationTouched) {
        this.handleShowAlert();
        return;
      }
      if (modificationIndex > 0) this.props.goPrevError();
    }

    const handleNextError = () => {
      if (this.state.isModificationTouched) {
        this.handleShowAlert();
        return;
      }
      if (modificationIndex < modificationList.length - 1) this.props.goNextError();
    }

    const handleHideModification = () => {
      if (this.state.isModificationTouched) {
        this.handleShowAlert();
        return;
      }
      this.props.hideModification();
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
      const {index, errors, errorType, fixedReferenceTable} = payload;      
    
      if (errorType === 'ERROR_FORMAT' || payload.field === 'source') {
        this.props.updateFlows(payload);
      }
      
      if(payload.field === 'year') {
        const rowNumbers = errors.map((e) => e.rowNumber);
        const columnIndex = flows[0].indexOf('year');
        const source = [flows[0]].concat(errors.map((e) => {
          const row = [...flows[e.rowNumber -1]]
          row[columnIndex] = payload.fixedValues['year'];
          return row;
        }));
        const relations = {currencies: referenceTables['currencies']}
        this.props.revalidateRows({
          originalValue: payload.value,
          fixedValues: payload.fixedValues,
          rowNumbers,
          source,
          schema,
          relations,
        });
      }

      if (errorType === 'ERROR_FOREIGN_KEY') {
        const prevFixedReferenceTable = modificationItem.fixedReferenceTable;
        if (prevFixedReferenceTable && fixedReferenceTable) {
          prevFixedReferenceTable.forEach((table) => {
            this.props.deleteTableRow(table);
          })
        }
        fixedReferenceTable.forEach((table) => {
          this.props.addTableRow(table)
        })
      }

      this.props.submitModification(payload);

      this.setState({
        isModificationTouched: false
      });

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
              isCurrencyFixDisabled={isCurrencyFixDisabled}
              modificationIndex={modificationIndex}
              modificationItem={modificationItem} 
              onTouch={this.handleTouchModification}
              onSubmitModification={handleSubmitModification} />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div>
                <Button isColor="info" onClick={handleHideModification}>
                  Back to summary
                </Button>
              </div>
              <span className="has-text-danger has-text-weight-bold">{modificationIndex + 1} / {modificationList.length }</span>
              <span>{(this.state.showAlert).toString()}</span>
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
            <AlertModal isActive={this.state.showAlert} closeModal={this.handleHideAlert} />
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  flows: state.flows.data,
  referenceTables: state.referenceTables.referenceTables,
  schema: getResourceSchema(state),
  modificationList: state.modification.modificationList,
  steps: state.ui.steps,
  selectedStep: state.ui.selectedStep,
  isModification: state.ui.isModification,
  modificationIndex: state.modification.modificationIndex
})

export default connect(mapStateToProps, {
  setStep,
  updateFlows,
  addTableRow,
  deleteTableRow,
  revalidateRows,
  hideModification,
  selectError,
  goNextError,
  goPrevError,
  submitModification
})(DataModification);