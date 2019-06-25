import React from 'react';

import {values, mapValues, sortBy, orderBy} from 'lodash';
import {
  Button,
  Field as FieldContainer,
  Label,
  Control,
  Help
} from 'design-workshop';
import Select from 'react-select';

import {getOptions} from '../utils/formUtils';

import FieldInput from './FieldInput';

const RANKED_FIELDS = {
  "type": 0,
  'RICname': 1,
  "continent": 2,
  "COW_code": 3
}

class NewRICentityForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps()
  }

  getStateFromProps = () => {
    const {resourceDescriptor} = this.props;
    const {schema} = resourceDescriptor;
    const fields = schema.fields.reduce((res, field) => {
      let value = '';
      let valid = true;
      if (field.constraints && field.constraints.enum) {
        const enumList = field.constraints.enum
        value = enumList[0]
      }
      if (field.constraints && field.constraints.required && !field.constraints.enum ) {
        valid = false
      }
      // TODO: hardcoded
      if (field.name === 'type') {
        value = 'group';
      }
      if (field.name === 'continent') {
        value = ''
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

  handleFieldChange = (payload) => {
    this.setState({
      fields: {
        ...this.state.fields,
        [payload.fieldName]: payload
      }
    })
  }

  handleChangeMulti = (event) => {
    const {referenceTables} = this.props;
    const table = referenceTables['RICentities'];

    const getRICname = (list) => {
      const orderedList = orderBy(list, [item => item.value.toLowerCase()], ['asc'])
      return orderedList.map((item) => item.value).join(' & ');
    }

    const getContinent = (list, table) => {
      const continents = list.map((item) => {
        const findRow = table.find((row) => row['RICname'] === item.value);
        return findRow.continent
      });
      if (continents.length > 1) return 'World';
      else if (continents.length === 1) return continents[0];
      return null;
    }

    const value = event ? getRICname(event) : '';
    const multiParts = event ? event : [];
    const continentValue = event ? getContinent(multiParts, table) : null;

    // mockup validation
    this.setState({
      multiParts,
      fields: {
        ...this.state.fields,
        RICname: {
          fieldName: 'RICname',
          value,
          fieldValid:{
            valid: value ==='' ? false: true,
            error: value === ''? {message: 'field is required'} : null
          }
        },
        continent: {
          fieldName: 'continent',
          value: continentValue,
          fieldValid:{
            valid: continentValue ==='' ? false: true,
            error: continentValue === ''? {message: 'field is required'} : null
          }
        }
      }
    });
  }

  render() {
    const {resourceDescriptor, referenceTables} = this.props;
    const {schema} = resourceDescriptor;
    const fieldsInvalid = values(this.state.fields).filter((field) => field.fieldValid && !field.fieldValid.valid);

    const handleAddNew = () => {
      const payload = {
        newResource: {
          resourceName: resourceDescriptor.name,
          data: [mapValues(this.state.fields, (item) => item.value || '')]
        },
        newReference: {
          resourceName: 'RICentities_groups',
          data: this.state.multiParts.map((part) => {
            return {
              'RICname_group': this.state.fields['RICname'].value,
              'RICname_part': part.value
            }
          })
        }
      }
      this.props.onAddNew(payload)
    }

    const sortedFields = sortBy(schema.fields, (field) => {
      return RANKED_FIELDS[field.name]
    })

    const options = getOptions({
      tables: referenceTables,
      resourceName: 'RICentities',
      referenceField: 'RICname',
      filter: {
        field: 'type',
        value: 'group'
      }
    });
    return (
      <div>
        <div style={{height: '40vh', overflow:'auto'}}>
          <h3>New row to "{resourceDescriptor.name}" table</h3>
          {
            sortedFields.map((field, index) => {
              if (field.name === 'RICname') {
                const {value, fieldValid} = this.state.fields[field.name];
                return (
                  <FieldContainer>
                    <Label>
                      {field.name}
                      {
                        field.constraints && field.constraints.required &&
                        <span>*</span>
                      }
                    </Label>
                    <Control>
                      <Select isSearchable={true}
                          isClearable={true}
                          isMulti
                          value={this.state.multiParts}
                          options={options}
                          onChange={this.handleChangeMulti} />
                        <div>{value}</div> 
                    </Control>
                    {
                      fieldValid && fieldValid.error && <Help isColor="danger">{fieldValid.error.message}</Help>
                    }
                  </FieldContainer> 
                )
              } 
              return (
                <FieldInput 
                  key={index}
                  isNonchangable={field.name !== 'RICname'}
                  referenceTables={referenceTables}
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
            <Button isColor="info" isDisabled={fieldsInvalid.length > 0}  onClick={handleAddNew}>Add new</Button>
          </Control>
        </FieldContainer>
      </div>
    )
  }
}
export default NewRICentityForm;