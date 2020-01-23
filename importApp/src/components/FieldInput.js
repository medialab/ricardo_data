
import React from 'react';

import {Field} from 'tableschema';
import {findIndex} from 'lodash';

import Select from 'react-select';
import Autosuggest from 'react-autosuggest';

import matchSorter from 'match-sorter';

import {
  Button,
  Field as FieldContainer,
  Label,
  Control,
  Input,
  Help,
} from 'design-workshop'


import {getEnumOptions, getOptions} from '../utils/formUtils';


class FieldInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps();
  }

  componentDidUpdate (prevProps) {
    const {fieldDescriptor, fieldValue, fixedValue} = this.props;
    if (fieldDescriptor.name === 'slug' && fieldValue !== prevProps.fieldValue) {
      this.validateField(fieldValue)
    }
    if (fixedValue !== prevProps.fixedValue && !fixedValue) {
      const state = this.getStateFromProps();
      this.setState({
        ...state
      })
    }
  }

  getStateFromProps = () => {
    const {fieldDescriptor, fieldValue} = this.props;
    const fieldSchema = new Field(fieldDescriptor);
    
    let options;
    if (fieldSchema.constraints && fieldSchema.constraints.enum) {
      options = getEnumOptions(fieldSchema.constraints.enum)
    }
    return {
      fieldSchema,
      value: fieldValue || '',
      fieldValid: {
        valid: false
      },
      options,
      suggestions: []
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
    let value;
    if(!event) {
      value = '';
      this.validateField(value);
    }
    else if(event && event.value) {
      this.validateField(event.value);
    }
    else if (event && event.target) {
      this.validateField(event.target.value);
    }
    else {
      this.validateField('')
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

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = (value, suggestedOptions) => {
    const getSuggestions = (value, options) => {
      const inputValue = value.trim().toLowerCase();
      const inputLength = inputValue.length;

      return inputLength === 0 ? [] : options.filter(option =>
        option.toLowerCase().slice(0, inputLength) === inputValue
      );
    };
    this.setState({
      suggestions: getSuggestions(value, suggestedOptions)
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  handleSuggestionChange =  (event, { newValue }) => {
    this.validateField(newValue)
  };


  // Use your imagination to render suggestions.
  renderSuggestion = suggestion => (
    <div>
      {suggestion}
    </div>
  );


  renderField() {
    const {fieldValue, foreignKeys, referenceTables, showNewReference, newReference, isNonchangable, isValidationField, suggestedOptions} = this.props;
    const {fieldSchema, value, suggestions} = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: '',
      value,
      onChange: this.handleSuggestionChange
    };

    let isReferenceField = false;
    
    const handleSuggestionsFetchRequested = ({value}) => {
      this.onSuggestionsFetchRequested(value, suggestedOptions)
    }
    let options;

    const generateValue = (value) => {
      return {
        value,
        label: value
      }
    }
    
    if (findIndex(foreignKeys, (item)=>item.fields === fieldSchema.name || item.fields.indexOf(fieldSchema.name) !== -1) !== -1) {
      const index = findIndex(foreignKeys, (item)=>item.fields === fieldSchema.name || item.fields.indexOf(fieldSchema.name) !== -1)
      const referenceField = foreignKeys[index].reference.fields;
      isReferenceField = true;
      
      options = getOptions({
        tables: referenceTables,
        resourceName: foreignKeys[index].reference.resource,
        referenceField: typeof(referenceField) === 'object' ? referenceField[0]: referenceField
      });
    }

    if (isNonchangable) {
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
              options={this.state.options}
              onChange={this.handleChange} 
              onInputChange={inputValue => {
                this.setState({ options : (matchSorter(options, inputValue, {keys: ['label']}).slice(0,50))});
              }}
              />
          }
          {
            newReference &&
            <div>{fieldValue}</div>
          }
          {
            (!this.state.value || isValidationField)  &&
            <Button isColor='info' onClick={this.handleClickCreate}>Create new item</Button>
          } 
        </div>
      )
    }
    else if (fieldSchema.constraints && fieldSchema.constraints.enum) {
      return (
        <Select isClearable={true}
        value= {generateValue(value)}
        options={this.state.options}
        onChange={this.handleChange} />
      )
    }
    else if (suggestedOptions) {
      return <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
      onSuggestionsClearRequested={this.onSuggestionsClearRequested}
      getSuggestionValue={(value) => value}
      renderSuggestion={this.renderSuggestion}
      inputProps={inputProps} />
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
    const {fieldSchema, fieldValid} = this.state;
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