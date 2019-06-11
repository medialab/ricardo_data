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
      })
   }
  }

  hydrateState = () => {
    const {modificationItem, fieldDescriptor} = this.props;
    const fieldSchema = new Field(fieldDescriptor);

    let fixedValue = modificationItem.value;
    if (modificationItem.fixedValues) fixedValue = modificationItem.fixedValues[fieldSchema.name];
    else if (fieldSchema.constraints && fieldSchema.constraints.enum) {
      fixedValue = fieldSchema.constraints.enum[0];
    }
    return {
      fieldSchema,
      fixedValue,
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
    this.validateField(event.target.value)
  }

  handleSubmitForm = () => {
    const {modificationItem} = this.props;
    const {fixedValue, fieldValid} = this.state;
    if(!fixedValue || fixedValue.length === 0 || !fieldValid.valid) return;
    const fixedValues = {
      [modificationItem.field]: fixedValue
    }
    this.props.onSubmitForm({fixedValues});
  }

  render() {
    const {modificationItem} = this.props;
    const {value, message, errors}= modificationItem;
    const {fieldSchema, fixedValue, fieldValid} = this.state;
    const isSubmitDisabled = !fieldValid || !fieldValid.valid
    const printValue = fixedValue.length === 0 ? 'null' : fixedValue;

    return (
      <div style={{height: '60vh'}}>
        <form>
          <Columns>
            <Column isSize='1/2'>
              <FieldContainer>
                <Label>Original value of "{fieldSchema.name}":</Label>
                {/* <Input value={value} disabled /> */}
                <div className="has-text-danger">{value}</div>
                <Help isColor="danger">{message}</Help>
              </FieldContainer>
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
                        fieldSchema.constraints.enum.map((item, index) => {
                          return (
                            <option key={index}>{item}</option>
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
  
              <FieldContainer>
                <Control>
                  <Button isColor="info" isDisabled={isSubmitDisabled} onClick={this.handleSubmitForm}>Confirm this fix</Button>
                </Control>
              </FieldContainer>
            </Column>
          </Columns>
  
        </form>    
      </div>
    )
  }
}

export default FormatCorrection;