import React from 'react';

import {
  Columns,
  Column,
  Button,
  Field as FieldContainer,
  Label,
  Control,
  Help,
} from 'design-workshop'  

import FieldInput from './FieldInput';

class FormatCorrection extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.hydrateState();
  }

  componentDidUpdate (prevProps) {
   if (this.props.modificationIndex !== prevProps.modificationIndex) {
      const state = this.hydrateState()
      this.setState({
        ...state
      });
   }
  }

  hydrateState = () => {
    const {modificationItem} = this.props;

    return {
      fixedValue: null,
      showSolving: !modificationItem.fixed,
      fieldValid: null
    }
  }

  handleFieldChange = (payload) => {
    const {value, fieldValid} = payload;
    this.setState({
      fixedValue: value,
      fieldValid
    })
  }


  handleSubmitForm = () => {
    const {modificationItem} = this.props;
    const {fixedValue, fieldValid} = this.state;
    if(!fieldValid || !fieldValid.valid) return;
    const fixedValues = {
      [modificationItem.field]: fixedValue
    }
    this.props.onSubmitForm({fixedValues});
  }

  handleShowSolving = () => {
    this.setState({
      showSolving: true
    })
  }

  handleHideSolving = () => {
    this.setState({
      showSolving: false
    })
  }

  renderOriginal() {
    const {modificationItem} = this.props;
    const {value, message, field}= modificationItem;

    return (
      <FieldContainer>
        <Label>Original value of "{field}":</Label>
        <strong>{value.length === 0 ? 'none': value}</strong>
        <Help isColor="danger">{message}</Help>
      </FieldContainer>
    )
  }

  renderFixed() {
    const {modificationItem} = this.props;
    const {fixedValues, field, errors}= modificationItem;
    const printValue = fixedValues[field].length === 0 ? 'none' : fixedValues[field];
    return (
      <FieldContainer>
        <Label className="has-text-success">Fixed with value</Label>
        <strong className="has-text-success">{printValue}</strong>
        <Help isColor="success">total {errors.length} rows affected</Help>
        <Button isColor="info" onClick={this.handleShowSolving}>Change this fix</Button>
      </FieldContainer>
    )
  }

  renderInput() {
    const {modificationItem, fieldDescriptor} = this.props;
    const {fieldValid} = this.state;
    const isSubmitDisabled = !fieldValid || !fieldValid.valid

    return (
      <div>
        <Label>Fix with a new input</Label>
        <FieldInput 
          fieldDescriptor={fieldDescriptor} 
          fieldValue={modificationItem.value}
          onChange={this.handleFieldChange} />
          
        <FieldContainer isGrouped>  
          {
             modificationItem.fixed &&
            <Control>
              <Button isColor="info" onClick={this.handleHideSolving}>Cancel</Button>
            </Control>
          }
          <Control>
            <Button isColor="info" isDisabled={isSubmitDisabled} onClick={this.handleSubmitForm}>Confirm this fix</Button>
          </Control>
        </FieldContainer>
      </div>
    )
  }

  render() {
    const {modificationItem} = this.props;
    const {fixed}= modificationItem;
    

    return (
      <div style={{height: '60vh'}}>
        <form>
          <Columns>
            <Column isSize="1/2">
              {this.renderOriginal()}
              {
                fixed && !this.state.showSolving && this.renderFixed()
              }
              {
                this.state.showSolving && this.renderInput()
              }

            </Column>
          </Columns>
  
        </form>    
      </div>
    )
  }
}

export default FormatCorrection;