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

class ForeignKeyCorrection extends React.Component {
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
    const {modificationItem, schema} = this.props;
    const {field}= modificationItem;
    return {}
    // const descriptor = schema.fields.find((f) => f.name === field)
    // const fieldSchema = new Field(descriptor);

    // let fixedValue = '';
    // if (modificationItem.fixedValue) fixedValue = modificationItem.fixedValue;
    // else if (schema.constraints && schema.constraints.enum) {
    //   fixedValue = schema.constraints.enum[0];
    // }
    // return {
    //   fieldSchema,
    //   fixedValue,
    //   fieldError: null
    // }
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
    const {modificationItem, schema} = this.props;
    const {value, message, errors, field}= modificationItem;
    const {fieldSchema, fixedValue, fieldError} = this.state;

    const isSubmitDisabled = !fixedValue || fixedValue.length === 0 || fieldError;
    // if (errorType === 'ERROR_FOREIGN_KEY') {
    //   const foreignKeys = schema.foreignKeys.find((f) => f.fields.indexOf(field) !==-1)
    //   fieldSchema = {
    //     ...fieldSchema,
    //     foreignKeys
    //   }
    // }

    return (
      <div style={{height: '60vh'}}>
        <form>
          <Columns>
            <Column isSize='1/2'>
              <FieldContainer>
                <Label>Original value of "{field}":</Label>
                {/* <Input value={value} disabled /> */}
                <div className="has-text-danger">{value}</div>
                <Help isColor="danger">{message}</Help>
              </FieldContainer>
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

export default ForeignKeyCorrection;