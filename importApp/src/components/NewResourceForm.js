import React from 'react';

import {Field, Schema} from 'tableschema';
import {values, mapValues, capitalize} from 'lodash';
import {
  Button,
  Field as FieldContainer,
  Label,
  Control,
  Input,
  Help,
  Select
} from 'design-workshop'

import {getEnumOptions} from '../utils/formUtils';

const nonChangableFields = ['slug', 'export_import', 'special_general']
const slugFields = ['author','name', 'country', 'volume_date', 'volume_number', 'pages'];

class FieldInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps();
  }

  componentDidUpdate (prevProps) {
    const {fieldDescriptor, fieldValue} = this.props;
    if (fieldDescriptor.name === 'slug' && fieldValue !== prevProps.fieldValue ) {
      this.validateField(fieldValue)
    }
  }

  getStateFromProps = () => {
    const {fieldDescriptor, fieldValue} = this.props;
    const fieldSchema = new Field(fieldDescriptor);
    
    let options;
    if (fieldSchema.constraints && fieldSchema.constraints.enum) {
      options = getEnumOptions(fieldSchema.constraints.enum, fieldSchema.constraints.required)
    }
    return {
      fieldSchema,
      value: fieldValue,
      fieldValid: {
        valid: false
      },
      options
    }
  }

  validateField = (value) => {
    const {fieldSchema} = this.state;
    let payload
    try {
      fieldSchema.castValue(value);
      payload  = {
        value,
        fieldValid: {
          valid: true
        }
      }
      this.setState(payload)
      this.props.onChange({
        fieldName: this.state.fieldSchema.name,
        ...payload
      })
    } catch(error) {
      payload = {
        value,
        fieldValid: {
          valid: false,
          error
        }
      }
      this.setState(payload)
      this.props.onChange({
        fieldName: this.state.fieldSchema.name,
        ...payload
      });
    }
  }

  handleChange = (event) => {
    this.validateField(event.target.value);
  }

  render() {
    const {fieldSchema, fieldValid, value} = this.state;

    return (
      <FieldContainer>
        <Label>
          {fieldSchema.name}
          {
            fieldSchema.constraints && fieldSchema.constraints.required &&
            <span>*</span>
          }
        </Label>
        { (nonChangableFields.indexOf(fieldSchema.name) !==-1) ?
          <Control>
            <span>{this.props.fieldValue}</span>
          </Control> :
          <Control>
            {
              fieldSchema.constraints && fieldSchema.constraints.enum ?
              <Select value={value} onChange={this.handleChange}>
                {
                  this.state.options.map((item, index) => {
                    return (
                      <option key={index} value={item.value}>{item.label}</option>
                    )
                  })
                }
              </Select>:
              <Input
                value={value}
                onChange={this.handleChange} />
            }
          </Control>}
        {
          fieldValid && fieldValid.message && <Help isColor="danger">{fieldValid.error.message}</Help>
        }
      </FieldContainer> 
    )
  }
}

const FieldSlug = ({fieldDescriptor, field}) => {
  return (
    <FieldContainer>
      <Label>{fieldDescriptor.name}*</Label>
      <Control>
        <span>{field.value}</span>
      </Control>
      {
        !field.value &&<Help isColor="danger">slug is required</Help>
      }
    </FieldContainer>
  )
}

class NewResourceForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps()
  }

  getStateFromProps = () => {
    const {resourceDescriptor, originalValue} = this.props;
    const {schema} = resourceDescriptor;
    const fields = schema.fields.reduce((res, field) => {
      let value = '';
      let valid = true;
      if (field.constraints && field.constraints.enum) {
        const enumList = field.constraints.enum
        value = enumList[0]
      }
      if(field.name === 'export_import') {
        value = originalValue.split('|')[0]
      }
      if(field.name === 'special_general') {
        value = originalValue.split('|')[1]
      }
      if (field.constraints && field.constraints.required && !field.constraints.enum ) {
        valid = false
      }
      return {
        ...res,
        [field.name]: {
          value,
          fieldValid: {
            valid
          }
        }
      }
    }, {});
    return {
      fields
    }
  }

  getSlug = (payload) => {
    const preFields = {
      ...this.state.fields,
      [payload.fieldName]: payload
    };
    const value = slugFields.reduce((res, f)=> {
      const printValue = preFields[f].value || ''
      return res + capitalize(printValue)
    }, '');
    return {
      fieldName: 'slug',
      value
    }
  }

  handleFieldChange = (payload) => {
    if (this.state.fields['slug'] && slugFields.indexOf(payload.fieldName) !== -1) {
      const slug = this.getSlug(payload);
      this.setState({
        fields: {
          ...this.state.fields,
          slug,
          [payload.fieldName]: payload
        }
      });
      return;
    }
    this.setState({
      fields: {
        ...this.state.fields,
        [payload.fieldName]: payload
      }
    })
  }

  render() {
    const {resourceDescriptor} = this.props;
    const {schema} = resourceDescriptor;
    const fieldsInvalid = values(this.state.fields).filter((field) => field.fieldValid && !field.fieldValid.valid);

    const handleAddNew = () => {
      const data = mapValues(this.state.fields, (item) => item.value || '');
      this.props.onAddNew(data)
    }
    return (
      <div>
        <div style={{height: '40vh', overflow:'auto'}}>
          <h3>Add a new row to "{resourceDescriptor.name}" table</h3>
          {
            schema.fields.map((field, index) => {
              return (
                <FieldInput 
                key={index}
                fieldDescriptor={field} 
                fieldValue={this.state.fields[field.name].value}
                onChange={this.handleFieldChange} />
              )
          })
          }
        </div>
        <FieldContainer isGrouped>
          <Control>
            <Button isColor="info" onClick={this.props.onCancel}>Cancel</Button>
          </Control>
          <Control>
            {/* TODO: add resource validation for all field */}
            <Button isColor="info" isDisabled={fieldsInvalid.length>0} onClick={handleAddNew}>Add new</Button>
          </Control>
        </FieldContainer>
      </div>
    )
  }
}
export default NewResourceForm;