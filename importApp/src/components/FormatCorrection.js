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
    this.state = this.hydrateState()
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
    const {modificationItem, descriptor} = this.props;
    const fieldSchema = new Field(descriptor);

    let fixedValue = '';
    if (modificationItem.fixedValue) fixedValue = modificationItem.fixedValue;
    else if (fieldSchema.constraints && fieldSchema.constraints.enum) {
      fixedValue = fieldSchema.constraints.enum[0];
    }
    return {
      fieldSchema,
      fixedValue,
      fieldError: null
    }
  }

  validateField = (value) => {
    const {fieldSchema} = this.state;
    try {
      fieldSchema.castValue(value)
      this.setState({
        fieldError: null
      })
    } catch(error) {
      this.setState({
        fieldError: error
      })
    }
  }

  handleChange = (event) => {
    this.setState({
      fixedValue: event.target.value
    });
    this.validateField(event.target.value);
  }

  handleSubmitForm = () => {
    const {fixedValue, fieldError} = this.state;
    if(!fixedValue || fixedValue.length === 0 || fieldError) return;
    this.props.onSubmitForm(fixedValue);
  }

  render() {
    const {modificationItem} = this.props;
    const {value, message, errors}= modificationItem;
    const {fieldSchema, fixedValue, fieldError} = this.state;
    const isSubmitDisabled = !fixedValue || fixedValue.length === 0 || fieldError;

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
                  <Label>Input a new value of "{fieldSchema.name}"</Label>
                  <Control>
                    <Input
                      value={this.state.fixedValue}
                      onChange={this.handleChange} />
                  </Control>
                  {
                    fieldError && <Help isColor="danger">{fieldError.message}</Help>
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
        {
          !isSubmitDisabled &&
            <span>change {value} to {this.state.fixedValue}, total {errors.length} rows affected</span>
        }
      </div>
    )
  }
}

export default FormatCorrection;