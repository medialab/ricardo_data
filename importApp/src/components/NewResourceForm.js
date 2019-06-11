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

class FieldInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps();
  }

  getStateFromProps = () => {
    const {fieldDescriptor, fieldValue} = this.props;
    const fieldSchema = new Field(fieldDescriptor);

    let value;
    let options;
    if (fieldValue) value = fieldValue
    else if (fieldSchema.constraints && fieldSchema.constraints.enum) {
      options = this.getOptions(fieldSchema.constraints.enum)
      value = options[0].value
    }
    return {
      fieldSchema,
      value,
      fieldValid: null,
      options
    }
  }

  getOptions = (enumList) => {
    const options = enumList.map((e) => {
      return {
        label: e,
        value: e
      }
    })
    options.unshift({
      value: '',
      label: 'none'
    })
    return options
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
    const {fieldSchema, fieldValid,value} = this.state;

    return (
      <div>
        {
          (!fieldSchema.constraints || !fieldSchema.constraints.enum) &&
          <FieldContainer>
            <Label>{fieldSchema.name}</Label>
            <Control>
              <Input
                value={value}
                onChange={this.handleChange} />
            </Control>
            {
              fieldValid!==null && !fieldValid.valid && <Help isColor="danger">{fieldValid.error.message}</Help>
            }
          </FieldContainer>
        }  
        {
          fieldSchema.constraints && fieldSchema.constraints.enum &&
          <FieldContainer>
            <Label>{fieldSchema.name}</Label>
            <Control>
              <Select value={value} onChange={this.handleChange}>
                {
                  this.state.options.map((item, index) => {
                    return (
                      <option key={index} value={item.value}>{item.label}</option>
                    )
                  })
                }
              </Select>
            </Control>
          </FieldContainer>
        }
      </div>
    )
  }
}

const FieldSlug = ({fieldDescriptor, field}) => {
  console.log(field)
  return (
    <FieldContainer>
      <Label>slug</Label>
      <Control>
        <span>{field.value}</span>
      </Control>
    </FieldContainer>
  )
}

const slugFields = ['author','name', 'country', 'volume_date', 'volume_number', 'pages'];

class NewResourceForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps()
  }

  // componentDidUpdate (prevProps) {
  //   this.state = this.getStateFromProps()
  // }

  getStateFromProps = () => {
    const {resourceDescriptor} = this.props;
    const {schema} = resourceDescriptor;
    const fields = schema.fields.reduce((res, field) => {
      return {
        ...res,
        [field.name]: {}
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
      },  

    })
  }

  render() {
    const {resourceDescriptor} = this.props;
    const {schema} = resourceDescriptor;
    const fieldsValid = values(this.state.fields).filter((field) => field.fieldValid && !field.fieldValid.valid);

    const handleAddNew = () => {
      const data = mapValues(this.state.fields, (item) => item.value || '')
      this.props.onAddNew(data)
    }
    return (
      <div>
        <div style={{height: '40vh', overflow:'auto'}}>
          <h3>Add a new row to "{resourceDescriptor.name}" table</h3>
          {
            schema.fields.map((field) => {
              if (field.name === 'slug') {
                return <FieldSlug fieldDescriptor={field} field={this.state.fields['slug']} />
              }
              return (
                <FieldInput fieldDescriptor={field} onChange={this.handleFieldChange} />
              )
          })
          }
        </div>
        <FieldContainer isGrouped>
          <Control>
            <Button isColor="info" onClick={this.props.onCancel}>Cancel</Button>
          </Control>
          <Control>
            <Button isColor="info" isDisabled={fieldsValid.length>0} onClick={handleAddNew}>Add new</Button>
          </Control>
        </FieldContainer>
      </div>
    )
  }
}
export default NewResourceForm;