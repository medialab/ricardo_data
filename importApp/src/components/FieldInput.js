
import React from 'react';

import {Field} from 'tableschema';
import {values, findIndex, uniq} from 'lodash';

import Select from 'react-select';
import {
  Button,
  Field as FieldContainer,
  Label,
  Control,
  Input,
  Help,
  Select as SimpleSelect
} from 'design-workshop'

import {nonChangableFields} from '../constants'
import {getEnumOptions} from '../utils/formUtils';

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
    if(!event) {
      const value = '';
      this.validateField(value);
    }
    else if(event.value) {
      this.validateField(event.value);
    }
    else {
      this.validateField(event.target.value);
    }
  }

  handleClickCreate = () => {
    const field = this.props.foreignKeys.find((f) => f.fields === this.state.fieldSchema.name);
    this.handleChange('');
    this.props.onClickCreate({
      referenceMap: {
        field: this.state.fieldSchema.name,
        referenceField: field ? field.reference.fields : this.state.fieldSchema.name
      }
    })
  }


  renderField() {
    const {fieldValue, foreignKeys, referenceTables, showNewReference, newReference, isFormatInput} = this.props;
    const {fieldSchema, fieldValid, value} = this.state;
    
    let isReferenceField = false;
    let options;

    const generateValue = (value) => {
      return {
        value,
        label: value
      }
    }

    const getOptions = ({tables, resourceName, referenceField}) => {
      const table = uniq(tables[resourceName].map((item) => item[referenceField]))
      return table.map((item) => {
        return {
          value: item,
          label: item
        }
      })
    }
    
    if (findIndex(foreignKeys, (item)=>item.fields === fieldSchema.name || item.fields.indexOf(fieldSchema.name) !== -1) !== -1) {
      const index = findIndex(foreignKeys, (item)=>item.fields === fieldSchema.name || item.fields.indexOf(fieldSchema.name) !== -1)
      const resourceName = foreignKeys[index].reference.resource;
      const referenceField = foreignKeys[index].reference.fields;
      isReferenceField = true;
      
      options = getOptions({
        tables: referenceTables,
        resourceName,
        referenceField: typeof(referenceField) === 'object' ? referenceField[0]: referenceField
      });
    }


    if (nonChangableFields.indexOf(fieldSchema.name) !==-1 && !isFormatInput) {
      return (<span>{fieldValue}</span>)
    }
    else if (isReferenceField) {
      return (
        <div>
          {
            !showNewReference && !newReference &&
            <Select isSearchable={true}
              isClearable={true}
              value={generateValue(value)}
              options={options}
              onChange={this.handleChange} />
          }
          {
            newReference &&
            <div>{fieldValue}</div>
          }
          <Button isColor='info' onClick={this.handleClickCreate}>Create new item</Button>
        </div>
      )
    }
    else if (fieldSchema.constraints && fieldSchema.constraints.enum) {
      return (
        <SimpleSelect value={value} onChange={this.handleChange}>
          {
            this.state.options.map((item, index) => {
              return (
                <option key={index} value={item.value}>{item.label}</option>
              )
            })
          }
        </SimpleSelect>
      )
    }
    else {
      return (
        <Input
        value={value}
        onChange={this.handleChange} />
      )
    }
  }

  render() {
    const {fieldSchema, fieldValid, value} = this.state;
    const {showNewReference, newReference} = this.props;
    return (
      <FieldContainer>
        <Label>
          {fieldSchema.name}
          {
            fieldSchema.constraints && fieldSchema.constraints.required &&
            <span>*</span>
          }
        </Label>
        <Control>
          {this.renderField()}
        </Control>
        {
          fieldValid && fieldValid.error && !showNewReference && !newReference &&
            <Help isColor="danger">{fieldValid.error.message}</Help>
        }
      </FieldContainer> 
    )
  }
}

export default FieldInput;