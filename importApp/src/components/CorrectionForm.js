import React from 'react';
import {
  Columns,
  Column,
  Button,
  Field,
  Label,
  Control,
  Input,
  Help,
  Select
} from 'design-workshop'

class CorrectionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.hydrateState()
  }
  componentDidUpdate (prevProps) {
   if (this.props.modificationIndex !== prevProps.modificationIndex) {
      const state = this.hydrateState()
      this.setState({
        fixedValue: state.fixedValue
      })
   }
  }

  hydrateState = () => {
    const {modificationItem, schema} = this.props;
    let fixedValue = '';
    if (modificationItem.fixedValue) fixedValue = modificationItem.fixedValue;
    else if (schema.constraints && schema.constraints.enum) {
      fixedValue = schema.constraints.enum[0];
    }
    return {
      fixedValue
    }
  }

  handleChange = (event) => {
    this.setState({
      fixedValue: event.target.value
    })
  }

  handleSubmitForm = () => {
    const {fixedValue} = this.state;
    if(!fixedValue || fixedValue.length === 0) return
    this.props.onSubmitForm(fixedValue);
  }

  render() {
    const {modificationItem, schema} = this.props;
    const {field, errorType, value, message, errors}= modificationItem;
    let fieldSchema = schema.fields.find((f) => f.name === field)
    // if (errorType === 'ERROR_FORMAT') {
    //   fieldSchema = schema.fields.find((f) => f.name === field)
    // }
    if (errorType === 'ERROR_FOREIGN_KEY') {
      const foreignKeys = schema.foreignKeys.find((f) => f.fields.indexOf(field) !==-1)
      fieldSchema = {
        ...fieldSchema,
        foreignKeys
      }
    }

    return (
      <div style={{height: '40vh'}}>
        <form>
          <Columns>
            <Column isSize='1/2'>
              <Field>
                <Label>Original value of "{fieldSchema.name}":</Label>
                <strong className="has-text-danger">{value}</strong>
                <Help isColor="danger">{message}</Help>
              </Field>
            </Column>
            <Column isSize='1/2'>
              {
                (!fieldSchema.constraints || !fieldSchema.constraints.enum) &&
                <Field>
                  <Label>Input a new value of "{fieldSchema.name}"</Label>
                  <Control>
                    <Input placeholder="input" 
                      value={this.state.fixedValue}
                      onChange={this.handleChange} />
                  </Control>
                  {/* <Help isColor="success"></Help> */}
                </Field>
              }
              
              {
                fieldSchema.constraints && fieldSchema.constraints.enum &&
                <Field>
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
                </Field>
              }
  
              <Field>
                <Control>
                  <Button isColor="info" onClick={this.handleSubmitForm}>Confirm this fix</Button>
                </Control>
              </Field>
            </Column>
          </Columns>
  
        </form>    
        {
          this.state.fixedValue.length > 0 &&
            <span>change {value} to {this.state.fixedValue}, total {errors.length} rows affected</span>
        }
      </div>
    )
  }
}

export default CorrectionForm;