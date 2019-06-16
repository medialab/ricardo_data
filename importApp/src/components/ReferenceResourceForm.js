import React from 'react';

import {values, mapValues, capitalize} from 'lodash';

import {
  Button,
  Field as FieldContainer,
  Control,
  Columns,
  Column
} from 'design-workshop';

import NewResourceForm from './NewResourceForm';
import FieldInput from './FieldInput';
import NewResourceRow from './NewResourceRow';

const slugFields = []
class ReferenceResourceForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps()
  }

  getStateFromProps = () => {
    const {resourceDescriptor, originalValue} = this.props;
    const {schema} = resourceDescriptor;
    const newResource = schema.fields.reduce((res, field) => {
      let value = '';
      let valid = true;
      if (field.constraints && field.constraints.enum) {
        const enumList = field.constraints.enum
        value = enumList[0]
      }

      if (field.constraints && field.constraints.required && !field.constraints.enum ) {
        valid = false
      }
      if(field.name === 'original_name') {
        value = originalValue;
        valid = true;
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
      newResource,
      showNewReference:false
    }
  }

  getSlug = (payload) => {
    const preFields = {
      ...this.state.newResource,
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
    if (this.state.newResource['slug'] && slugFields.indexOf(payload.fieldName) !== -1) {
      const slug = this.getSlug(payload);
      this.setState({
        newResource: {
          ...this.state.newResource,
          slug,
          [payload.fieldName]: payload
        }
      });
      return;
    }
    this.setState({
      newResource: {
        ...this.state.newResource,
        [payload.fieldName]: payload
      }
    })
  }

  handleShowNew = (payload) => {
    this.setState({
      showNewReference: true
    })
  }

  handleHideNew = () => {
    const {referenceField} = this.state;
    this.setState({
      showNewReference: false,
      newReference: null,
      referenceField: null,
      newResource: {
        ...this.state.newResource,
        [referenceField]: {
          fieldValid: {valid: false},
          value: ''
        }
      }
    })
  }

  handleCreateNewReference = (payload) => {
    const {referenceField} = payload;
    this.setState({
      showNewReference: true,
      referenceField,
      newReference: null,
      newResource: {
        ...this.state.newResource,
        [referenceField]: {
          fieldValid: {valid: false},
          value: ''
        }
      }
    })
  }

  handleAddNewReference = (payload) => {
    const {newResource} = payload
    const {referenceField} = this.state;
    this.setState({
      newReference: newResource,
      showNewReference: false,
      newResource: {
        ...this.state.newResource,
        [referenceField]: {
          fieldValid: {valid: true},
          value: newResource.data[referenceField]
        }
      }
    })
  }

  handleResetNewReference = () => {
    const {referenceField} = this.state;
    this.setState({
      newReference: null,
      showNewReference: true,
      newResource: {
        ...this.state.newResource,
        [referenceField]: {
          fieldValid: {valid: false},
          value: ''
        }
      }
    })
  }

  render() {
    const {resourceDescriptor, referenceDescriptor, referenceTables} = this.props;
    const {schema} = resourceDescriptor;
    const fieldsInvalid = values(this.state.newResource).filter((field) => field.fieldValid && !field.fieldValid.valid);
    const handleAddNew = () => {
      const payload = {
        newResource: {
          resourceName: resourceDescriptor.name,
          data: mapValues(this.state.newResource, (item) => item.value || ''),
        },
        newReference: this.state.newReference
      }
      this.props.onAddNew(payload)
    }
    return (
      <div>
        <Columns>
          <Column>
            <h3>New row to "{resourceDescriptor.name}" table</h3>
            {
              schema.fields.map((field, index) => {
                return (
                  <FieldInput 
                    key={index}
                    fieldDescriptor={field}
                    foreignKeys={schema.foreignKeys}
                    referenceTables={referenceTables}
                    fieldValue={this.state.newResource[field.name].value}
                    showNewReference={this.state.showNewReference}
                    newReference={this.state.newReference}
                    onClickCreate={this.handleCreateNewReference}
                    onChange={this.handleFieldChange} />
                )
              })
            }
          </Column>
          <Column>
            {this.state.showNewReference &&
              <NewResourceForm 
                resourceDescriptor={referenceDescriptor} 
                onCancel={this.handleHideNew}
                onAddNew={this.handleAddNewReference} />
            }
            {this.state.newReference && 
              <div>
                <NewResourceRow resource={this.state.newReference} />
                <Button onClick={this.handleResetNewReference}>Reset</Button>
              </div>
            }
          </Column>
        </Columns>
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
export default ReferenceResourceForm;