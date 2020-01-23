import React from 'react';
import {Table} from 'tableschema';

import {keys, values, mapValues, sortBy, uniq} from 'lodash';

import {
  Button,
  Field as FieldContainer,
  Control,
  Help,
  Columns,
  Column
} from 'design-workshop';

import FieldInput from './FieldInput';
import NewResourceRow from './NewResourceRow';
import NewRICentityForm from './NewRICentityForm';
import {NON_CHANGABLE_FIELDS, SOURCE_SLUGIFY, SOURCE_SUGGESTION_FIELDS} from '../constants';

const castFormObject = (formObject) =>  mapValues(formObject, (v => v.value));


class ReferenceResourceForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps()
  }

  getStateFromProps = () => {
    const {resourceDescriptor, originalValues, prefixedValues} = this.props;
    const {schema} = resourceDescriptor;
    const newResource = schema.fields.reduce((res, field) => {
      let value = '';
      let valid = true;

      if (field.constraints && field.constraints.required) {
        valid = false
      }
      if(originalValues && originalValues.find((item) => item.referenceField=== field.name) && field.name !== 'slug') {
        value = originalValues.find((item) => item.referenceField=== field.name).value;
        valid = true;
      }
      if (prefixedValues && prefixedValues[field.name]) {
        value = prefixedValues[field.name];
        valid = true
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
    let preFields = {
      ...this.state.newResource,
      [payload.fieldName]: payload
    };
    // remove field data structure to mimic source object
    const value = SOURCE_SLUGIFY(castFormObject(preFields)) ;
    return {
      fieldName: 'slug',
      value
    }
  }

  handleFieldChange = (payload) => {
    const {resourceDescriptor} = this.props;

    if (this.state.newResource['slug']) {
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
    
    if (resourceDescriptor.name === 'ricentities' && payload.fieldName === 'type' && payload.value === 'group') {
      this.props.onSelectGroup()
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
      isRICentityGroup: false,
      prefixedValues: null,
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
    const {field} = referenceMap;
    this.setState({
      showNewReference: true,
      resourceValid: {
        valid: true
      },
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
          value: newResource.data[0][referenceField]
        }
      }
    })
  }

  handleResetNewReference = () => {
    const {referenceMap} = this.state;
    const {field} = referenceMap;
    this.setState({
      newReference: null,
      newRefReference: null,
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

  handleSelectGroup = () => {
    this.setState({
      isRICentityGroup: true
    })
  }

  render() {
    const {descriptor, resourceDescriptor, referenceTables, originalValues, prefixedValues} = this.props;
    const {schema} = resourceDescriptor;
    const fieldsInvalid = values(this.state.newResource).filter((field) => field.fieldValid && !field.fieldValid.valid);

    const getReferenceDescriptor = () => {
      if (schema.foreignKeys) {
        const {reference} = schema.foreignKeys[0];
        return descriptor.resources.find((resource) => resource.name === reference.resource);
      }
      return;
    }
    
    const handleAddNew = async () =>{
      const payload = {
        newResource: {
          resourceName: resourceDescriptor.name,
          data: [mapValues(this.state.newResource, (item) => item.value || '')]
        },
        newReference: this.state.newReference,
        newRefReference: this.state.newRefReference
      }

      // TODO: hardcoded
      if (resourceDescriptor.name === 'currencies' && !this.state.newReference) {
        const source = [keys(payload.newResource.data[0])].concat([values(payload.newResource.data[0])]);
        const relations = {
          exchange_rates: referenceTables['exchange_rates']
        };
        let table;
        const prefixedValues = {
          "modified_currency": this.state.newResource['modified_currency'].value
        }
        try {
          table = await Table.load(source, {schema});
          const rows = await table.read({forceCast: true, relations});
          const errors = rows.filter((row) => row.errors);
          if (errors.length) {
            this.setState({
              prefixedValues,
              resourceValid: {
                valid: false,
                message: errors[0].errors[0].errors[0].message
              }
            });
          } else {
            this.setState({
              resourceValid: {valid: true}
            })
            this.props.onAddNew(payload)
          }
        } catch (error) {
          this.setState({
            prefixedValues,
            resourceValid: {
              valid: false,
              message: error.message || 'validation fail'
            }
          });
          console.error(error)
        }
      }
      else this.props.onAddNew(payload)
    }
    return (
      <div>
        <Columns>
          <Column style={{height: '50vh', overflow:'auto'}}>
            <h3>New row to "{resourceDescriptor.name}" table</h3>
            {
              sortBy(schema.fields, (field) => field.constraints && field.constraints.required)
              .map((field, index) => {
                let suggestedOptions;
                if (resourceDescriptor.name === 'sources' && SOURCE_SUGGESTION_FIELDS.indexOf(field.name)!== -1) {
                  suggestedOptions = uniq(referenceTables['sources'].map((d) => d[field.name]))
                }
                return (
                  <FieldInput 
                    key={index}
                    isNonchangable={NON_CHANGABLE_FIELDS.indexOf(field.name) !==-1 || (prefixedValues && prefixedValues[field.name])}
                    isValidationField={this.state.prefixedValues && this.state.prefixedValues[field.name]}
                    fieldDescriptor={field}
                    foreignKeys={schema.foreignKeys}
                    referenceTables={referenceTables}
                    suggestedOptions={suggestedOptions}
                    fieldValue={(this.state.newResource[field.name] && this.state.newResource[field.name].value) || (prefixedValues && prefixedValues[field.name])}
                    showNewReference={this.state.showNewReference}
                    newReference={this.state.newReference}
                    onClickCreate={this.handleCreateNewReference}
                    onChange={this.handleFieldChange} />
                )
              })
            }
            {
              this.state.resourceValid && this.state.resourceValid.message &&
              <FieldContainer>
                <Help isColor="danger">{this.state.resourceValid.message}</Help>
              </FieldContainer>
            }
          </Column>
          {schema.foreignKeys && 
          <Column>
            {this.state.showNewReference && 
            (this.state.isRICentityGroup ?
              <NewRICentityForm
                descriptor={descriptor}
                resourceDescriptor={getReferenceDescriptor()} 
                referenceTables={referenceTables}
                onCancel={this.handleHideNew}
                onAddNew={this.handleAddNewReference} /> :
              <ReferenceResourceForm
                descriptor={descriptor}
                originalValues={originalValues.filter((item)=> item.field === 'year')}
                resourceDescriptor={getReferenceDescriptor()} 
                referenceTables={referenceTables}
                prefixedValues={this.state.prefixedValues}
                onSelectGroup={this.handleSelectGroup}
                onCancel={this.handleHideNew}
                onAddNew={this.handleAddNewReference} />
            )
            }
            {this.state.newReference && 
              <div>
                <NewResourceRow resource={this.state.newReference} />
                <Button onClick={this.handleResetNewReference}>Reset</Button>
              </div>
            }
          </Column>}
          {schema.foreignKeys && this.state.newRefReference && 
            <Column>
              <NewResourceRow resource={this.state.newRefReference} />
            </Column>
          }
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