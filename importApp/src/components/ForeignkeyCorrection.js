import React from 'react';
import {connect} from 'react-redux';
import {values, isNil} from 'lodash'

import {Field, Schema} from 'tableschema';
import Select from 'react-select';

import {
  Columns,
  Column,
  Button,
  Field as FieldContainer,
  Label,
  Control,
  Input,
  Help,
} from 'design-workshop';

import {validateResource} from '../redux/modules/schemaValidation';


import NewResourceForm from './NewResourceForm';

class ForeignKeyCorrection extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.hydrateState()
  }

  componentDidUpdate (prevProps) {
   if (this.props.modificationIndex !== prevProps.modificationIndex) {
      const state = this.hydrateState();
      this.setState({
        ...state
      })
   }
  }

  initFixedValues = () => {
    const {modificationItem} = this.props;
    const fieldList = modificationItem.field.split('|');

    return fieldList.reduce((res, field) => {
      return {
        ...res,
        [field]: ''
      }
    }, {});
  }

  hydrateState = () => {
    const {modificationItem} = this.props;

    let fixedValues = this.initFixedValues()
    if (modificationItem.fixedValues) fixedValues = modificationItem.fixedValues

    return {
      fixedValues,
      showNewForm: false,
      newRow: null,
    }
  }

  handleSubmitForm = () => {
    const resourceName = this.props.foreignKeyField.reference.resource;  
    const {fixedValues, newRow} = this.state;
    // if(!fixedValue || fixedValue.length === 0) return;
    this.props.onSubmitForm({
      fixedValues,
      fixedReferenceTable: newRow ? resourceName :null,
    });
    if (newRow) {
      this.props.onUpdateTable({
        row: newRow,
        resourceName
      });
    }
  }

  handleClickCreate = () => {
    const fixedValues = this.initFixedValues()
    this.setState({
      fixedValues,
      showNewForm: true
    })
  }

  handleAddNewRow = (row) => {
    // delete referenceFieldResource.path
    // referenceFieldResource.data = tables[resourceName].push(values);
    // this.props.validateResource(referenceFieldResource)
    const {modificationItem, foreignKeyField} = this.props;

    const fieldList = modificationItem.field.split('|');
    const fixedValues = fieldList.reduce((res, field, index) => {
      return {
        ...res,
        [field]: fieldList.length > 1 ? row[foreignKeyField.reference.fields[index]] : row[foreignKeyField.reference.fields]
      }
    }, {})
    this.setState({
      newRow: row,
      fixedValues,
      showNewForm: false
    })
  }

  handleCancel = () => {
    this.setState({
      showNewForm: false,
      newRow: null
    })
  }

  handleSelectExist = (item) => {
    const {modificationItem} = this.props;
    if (!item) {
      this.setState({
        fixedValues: {
          [modificationItem.field]: ''
        }
      })
    }
    else {
      this.setState({
        fixedValues: {
          [modificationItem.field]: item.value
        },
        newRow: null
      })
    }
  }

  render() {
    const {newRow, fixedValues} = this.state;
    const {modificationItem, schema, foreignKeyField, tables, descriptor} = this.props;
    const {value, message, errors, field, fixedReferenceTable}= modificationItem;
    const resourceName = foreignKeyField.reference.resource;  
    const referenceFieldResource = descriptor.resources.find((resource) => resource.name === resourceName);
    const referenceField = foreignKeyField.reference.fields

    const generateValue = (value) => {
      return {
        value,
        label: value
      }
    }
    const fixedValueSelected = this.state.newRow ? generateValue(''): generateValue(fixedValues[field])

    const getOptions = () => {
      const table = tables[resourceName];
      return table.map((item) => {
        return {
          value: item[referenceField],
          label: item[referenceField]
        }
      })
    }

    const isSubmitDisabled= !this.state.newRow && fixedValueSelected.value === '';

    return (
      <div style={{height: '60vh'}}>
        <form>
          <Columns>
            <Column isSize='1/2'>
              <FieldContainer>
                <Label>Original value of "{field}":</Label>
                {/* <Input value={value} disabled /> */}
                <div className="has-text-danger">{value}</div>
                <Help isColor="danger">{message}</Help>
              </FieldContainer>
              {
                modificationItem.field === 'source' &&
                <FieldContainer>
                  <Label>Select from exist sources</Label>
                  <Select 
                    isSearchable={true}
                    isClearable={true}
                    value={fixedValueSelected}
                    onChange={this.handleSelectExist}
                    options={getOptions()} />
                  {
                    fixedValueSelected.value !== '' && !fixedReferenceTable &&
                      <Help isColor="success">
                        <li>change "{modificationItem.value}" to "{values(fixedValues).join("|")}"</li>
                        <li>total {modificationItem.errors.length} rows affected</li>
                      </Help>
                  }
                </FieldContainer>
              }

              <FieldContainer>
                <Control>
                  <Label>Not found one</Label>
                  <Button isColor="info" onClick={this.handleClickCreate}>Create new item</Button>
                  {
                    (this.state.newRow) &&
                    <Help isColor="success">
                      <li>change "{modificationItem.value}" to "{values(fixedValues).join("|")}"</li>
                      <li>total {modificationItem.errors.length} rows affected</li>
                      <li>new row will be added to "{resourceName}" table</li>
                    </Help>
                  }
                </Control>
              </FieldContainer>
            </Column>

            {
              this.state.showNewForm && 
              (modificationItem.field === 'source'|| modificationItem.field === 'export_import|special_general') &&
              <Column isSize='1/2' className='new-resource-form' style={{flex: 'auto'}}>
                <NewResourceForm 
                  resourceDescriptor={referenceFieldResource} 
                  onCancel={this.handleCancel}
                  onAddNew={this.handleAddNewRow} />
              </Column>
            }
          </Columns>
          <FieldContainer>
            <Control>
              <Button isColor="info" isDisabled={isSubmitDisabled} onClick={this.handleSubmitForm}>Confirm this fix</Button>
              {
                fixedReferenceTable &&
                  <Help isColor="success">
                    <li>fixed "{modificationItem.value}" with "{values(fixedValues).join("|")}"</li>
                    <li>total {modificationItem.errors.length} rows affected</li>
                    <li>new row is added to "{resourceName}" table</li>
                  </Help>
              }
            </Control>
          </FieldContainer>
  
        </form>
      </div>
    )
  }
}
export default connect(null, {
  validateResource
})(ForeignKeyCorrection);