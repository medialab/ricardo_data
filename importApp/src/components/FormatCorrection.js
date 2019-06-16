import React from 'react';
import {Field, Schema} from 'tableschema';

import {
  Columns,
  Column,
  Button,
  Field as FieldContainer,
  Label,
  Control,
  Input,
  Help,
  Select
} from 'design-workshop'  

import {getEnumOptions} from '../utils/formUtils' 

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
    const {modificationItem, fieldDescriptor} = this.props;
    const fieldSchema = new Field(fieldDescriptor);

    let fixedValue = modificationItem.value;
    let options;
    if (modificationItem.fixedValues) fixedValue = modificationItem.fixedValues[fieldSchema.name];
    if (fieldSchema.constraints && fieldSchema.constraints.enum) {
      options = getEnumOptions(fieldSchema.constraints.enum, fieldSchema.constraints.required);
      // fixedValue = options[0].value;
    }
    return {
      fieldSchema,
      fixedValue,
      options,
      showSolving: !modificationItem.fixed,
      fieldValid: null
    }
  }

  validateField = (value) => {
    const {fieldSchema} = this.state;
    try {
      fieldSchema.castValue(value);
      this.setState({
        fixedValue: value,
        fieldValid: {
          valid: true
        }
      })
    } catch(error) {
      this.setState({
        fixedValue: value,
        fieldValid: {
          valid: false,
          error
        }
      })
    }
  }

  handleChange = (event) => {
    event.preventDefault()
    this.validateField(event.target.value)
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
    const {modificationItem} = this.props;
    const {value, errors}= modificationItem;
    const {fieldSchema, fixedValue, fieldValid} = this.state;
    const isSubmitDisabled = !fieldValid || !fieldValid.valid
    const printValue = fixedValue.length === 0 ? 'none' : fixedValue;

    return (
      <div>
        {
          (!fieldSchema.constraints || !fieldSchema.constraints.enum) &&
          <FieldContainer>
            <Label>Fix with a new input</Label>
            <Control>
              <Input
                value={this.state.fixedValue}
                onChange={this.handleChange} />
            </Control>
            {
              fieldValid!==null && !fieldValid.valid && <Help isColor="danger">{fieldValid.error.message}</Help>
            }
            {
              !isSubmitDisabled &&
              <Help isColor="success">change {value} to {printValue}, total {errors.length} rows affected</Help>
            }
          </FieldContainer>
        }
        
        {
          fieldSchema.constraints && fieldSchema.constraints.enum &&
          <FieldContainer>
            <Label>Select a value of "{fieldSchema.name}" from:</Label>
            <Control>
              <Select value={this.state.fixedValue} onChange={this.handleChange}>
                {
                  this.state.options
                    .map((item, index) => {
                    return (
                      <option key={index} value={item.value}>{item.label}</option>
                    )
                  })
                }
              </Select>
              {
                !isSubmitDisabled &&
                  <Help isColor="success">change {value} to {printValue}, total {errors.length} rows affected</Help>
              }
            </Control>
          </FieldContainer>
        }

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