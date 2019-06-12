import React from 'react';
import {connect} from 'react-redux';
import {values} from 'lodash'

import Select from 'react-select';

import {
  Columns,
  Column,
  Button,
  Field as FieldContainer,
  Label,
  Control,
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
      showSolving: !modificationItem.fixed,
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
      showNewForm: true,
      newRow: null
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

  handleShowSolving = () => {
    this.setState({
      showSolving: true
    })
  }

  handleHideSolving = () => {
    this.setState({
      showSolving: false
    })
  }

  renderFixed() {
    const {modificationItem, foreignKeyField} = this.props;
    const {fixedValues}= modificationItem;
    const fixedValue = values(fixedValues).join('|');
    const printValue = fixedValue.length ? 'none': fixedValue;
    const resourceName = foreignKeyField.reference.resource;  

    return (
      <FieldContainer>
        <Label className="has-text-success">Fixed with value</Label>
        <strong className="has-text-success">{printValue}</strong>
        <Help isColor="success">
          <li>total {modificationItem.errors.length} rows affected</li>
          <li>new row will be added to "{resourceName}" table</li>
        </Help>
        <br/>
        <Button isColor="info" onClick={this.handleShowSolving}>Change this fix</Button>
      </FieldContainer>
    )
  }

  renderSolving() {
    const {modificationItem, foreignKeyField, tables} = this.props;
    const {field, fixedReferenceTable}= modificationItem;

    const resourceName = foreignKeyField.reference.resource;  
    const referenceField = foreignKeyField.reference.fields;

    const generateValue = (value) => {
      return {
        value,
        label: value
      }
    }
    
    const fixedValueSelected = this.state.newRow ? generateValue(''): generateValue(this.state.fixedValues[field])

    const getOptions = () => {
      const table = tables[resourceName];
      return table.map((item) => {
        return {
          value: item[referenceField],
          label: item[referenceField]
        }
      })
    }
    return (
      <div>
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
                  <li>change "{modificationItem.value}" to "{values(this.state.fixedValues).join("|")}"</li>
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
                <li>change "{modificationItem.value}" to "{values(this.state.fixedValues).join("|")}"</li>
                <li>total {modificationItem.errors.length} rows affected</li>
                <li>new row will be added to "{resourceName}" table</li>
              </Help>
            }
          </Control>
        </FieldContainer>  
      </div>
    )
    
  }

  render() {
    const {newRow, fixedValues} = this.state;
    const {modificationItem, foreignKeyField,descriptor} = this.props;
    const {value, message, field}= modificationItem;
    const resourceName = foreignKeyField.reference.resource;  
    const referenceFieldResource = descriptor.resources.find((resource) => resource.name === resourceName);
    // const referenceField = foreignKeyField.reference.fields

    const generateValue = (value) => {
      return {
        value,
        label: value
      }
    }
    const fixedValueSelected = this.state.newRow ? generateValue(''): generateValue(fixedValues[field])

    const isSubmitEnabled= this.state.newRow || fixedValueSelected.value;

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
              {!this.state.showSolving && this.renderFixed()}
              {this.state.showSolving && this.renderSolving()}
            </Column>
            {
              this.state.showNewForm && 
              (modificationItem.field === 'source'|| modificationItem.field === 'export_import|special_general') &&
              <Column isSize='1/2' className='new-resource-form' style={{flex: 'auto'}}>
                <NewResourceForm 
                  originalValue={modificationItem.value}
                  resourceDescriptor={referenceFieldResource} 
                  onCancel={this.handleCancel}
                  onAddNew={this.handleAddNewRow} />
              </Column>
            }
          </Columns>
          {
            this.state.showSolving &&
            <FieldContainer isGrouped>  
              <Control>
                <Button isColor="info" onClick={this.handleHideSolving}>Cancel</Button>
              </Control>
              <Control>
                {
                  isSubmitEnabled &&
                    <Button isColor="info" onClick={this.handleSubmitForm}>Confirm this fix</Button>
                }
              </Control>
            </FieldContainer>
          }

        </form>
      </div>
    )
  }
}
export default connect(null, {
  validateResource
})(ForeignKeyCorrection);