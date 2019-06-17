
import React from 'react';

import {values, mapValues, capitalize, pick} from 'lodash';

import {
  Button,
  Field as FieldContainer,
  Control,
  Columns,
  Column
} from 'design-workshop';
import {nonChangableFields} from '../constants'

import NewResourceForm from './NewResourceForm';
import FieldInput from './FieldInput';
import NewResourceRow from './NewResourceRow';

const slugFields = ['author','name', 'country', 'volume_date', 'volume_number', 'pages'];
class ReferenceResourceForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps()
  }

  getStateFromProps = () => {
    const {resourceDescriptor, originalValues} = this.props;
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
      if(nonChangableFields.indexOf(field.name) !== -1) {
        value = originalValues[field.name];
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
    const {referenceMap} = this.state;
    const {field} = referenceMap;
    this.setState({
      showNewReference: false,
      newReference: null,
      referenceMap: null,
      newResource: {
        ...this.state.newResource,
        [field]: {
          fieldValid: {valid: false},
          value: ''
        }
      }
    })
  }

  handleCreateNewReference = (payload) => {
    const {referenceMap} = payload
    const {field, referenceField} = referenceMap;
    this.setState({
      showNewReference: true,
      referenceMap,
      newReference: null,
      newResource: {
        ...this.state.newResource,
        [field]: {
          fieldValid: {valid: false},
          value: ''
        }
      }
    })
  }

  handleAddNewReference = (payload) => {
    const {newResource, newReference} = payload;
    const {field, referenceField} = this.state.referenceMap;
    this.setState({
      newReference: newResource,
      newRefReference: newReference,
      showNewReference: false,
      newResource: {
        ...this.state.newResource,
        [field]: {
          fieldValid: {valid: true},
          value: newResource.data[referenceField]
        }
      }
    })
  }

  handleResetNewReference = () => {
    const {referenceMap} = this.state;
    const {field} = referenceMap;
    this.setState({
      newReference: null,
      showNewReference: true,
      newResource: {
        ...this.state.newResource,
        [field]: {
          fieldValid: {valid: false},
          value: ''
        }
      }
    })
  }

  render() {
    const {descriptor, resourceDescriptor, referenceTables, originalValues} = this.props;
    const {schema} = resourceDescriptor;
    const fieldsInvalid = values(this.state.newResource).filter((field) => field.fieldValid && !field.fieldValid.valid);
    const getReferenceDescriptor = () => {
      if (schema.foreignKeys) {
        const {reference} = schema.foreignKeys[0];
        return descriptor.resources.find((resource) => resource.name === reference.resource);
      }
      return;
    }
    const handleAddNew = () => {
      const payload = {
        newResource: {
          resourceName: resourceDescriptor.name,
          data: mapValues(this.state.newResource, (item) => item.value || ''),
        },
        newReference: this.state.newReference,
        newRefReference: this.state.newRefReference
      }
      this.props.onAddNew(payload)
    }
    return (
      <div>
        <Columns>
          <Column style={{height: '50vh', overflow:'auto'}}>
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
          {schema.foreignKeys && 
          <Column>
            {this.state.showNewReference &&
              <ReferenceResourceForm
                descriptor={descriptor}
                originalValues={pick(originalValues, nonChangableFields)}
                resourceDescriptor={getReferenceDescriptor()} 
                referenceTables={referenceTables}
                onCancel={this.handleHideNew}
                onAddNew={this.handleAddNewReference} />
            }
            {this.state.newReference && 
              <div>
                <NewResourceRow resource={this.state.newReference} />
                <Button onClick={this.handleResetNewReference}>Reset</Button>
              </div>
            }
          </Column>}
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