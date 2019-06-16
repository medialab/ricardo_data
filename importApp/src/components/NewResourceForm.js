import React from 'react';

import {values, mapValues, capitalize} from 'lodash';
import {
  Button,
  Field as FieldContainer,
  Control,
} from 'design-workshop';

import FieldInput from './FieldInput';

const slugFields = ['author','name', 'country', 'volume_date', 'volume_number', 'pages'];


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
      const payload = {
        newResource: {
          resourceName: resourceDescriptor.name,
          data: mapValues(this.state.fields, (item) => item.value || '')
        }
      }
      this.props.onAddNew(payload)
    }
    return (
      <div>
        <div style={{height: '40vh', overflow:'auto'}}>
          <h3>New row to "{resourceDescriptor.name}" table</h3>
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