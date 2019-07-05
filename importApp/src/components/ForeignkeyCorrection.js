import React from 'react';
import {connect} from 'react-redux';
import {values, pick, isNil, difference} from 'lodash'

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

import {NON_CHANGABLE_FIELDS, LABEL_FIELDS_FK_SOLVED} from '../constants'

import {validateResource} from '../redux/modules/schemaValidation';

import NewResourceRow from './NewResourceRow';
import ReferenceResourceForm from './ReferenceResourceForm';
import FieldInput from './FieldInput';

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
      newResource: null,
      newReference: null,
      newRefReference: null,
      showSolving: !modificationItem.fixed,
    }
  }

  handleSubmitForm = () => {
    const {fixedValues, newResource, newReference, newRefReference} = this.state;
    // if(!fixedValue || fixedValue.length === 0) return;
    let fixedReferenceTable = []
    if (newResource) {
      fixedReferenceTable.push(newResource);
    }
    if (newReference) {
      fixedReferenceTable.push(newReference);
    }
    if (newRefReference) {
      fixedReferenceTable.push(newRefReference);
    }

    this.props.onSubmitForm({
      fixedValues,
      fixedReferenceTable
    });
  }

  handleClickCreate = () => {
    this.props.onTouch(true);
    const fixedValues = this.initFixedValues();
    this.setState({
      fixedValues,
      showSolving: true,
      showNewForm: true,
      newResource: null,
      newReference: null,
      newRefReference: null
    })
  }

  handleResetCreate = () => {
    this.setState({
      showNewForm: true,
      newResource: null,
      newReference: null
    })
  }

  handleAddNewResource = (payload) => {
    const {newResource, newReference, newRefReference} = payload;
    const {modificationItem, foreignKeyField} = this.props;

    const fieldList = modificationItem.field.split('|');
    const fixedValues = fieldList.reduce((res, field, index) => {
      let fixedValue = fieldList.length > 1 ? newResource.data[0][foreignKeyField.reference.fields[index]]:
                                              newResource.data[0][foreignKeyField.reference.fields]
      if (Object.keys(LABEL_FIELDS_FK_SOLVED).indexOf(field) !== -1) {
        // incase the value of mapping is not found
        if (newResource.data[0][LABEL_FIELDS_FK_SOLVED[field]]) {
          fixedValue = newResource.data[0][LABEL_FIELDS_FK_SOLVED[field]]
        }
      }
      return {
        ...res,
        [field]: fixedValue
      }
    }, {})
    this.setState({
      newResource,
      newReference,
      newRefReference,
      fixedValues,
      showNewForm: false
    })
  }

  handleCancel = () => {
    this.setState({
      showNewForm: false,
      newResource: null,
      newReference: null,
      newRefReference: null
    })
  }

  handleSelectExist = (item) => {
    const {modificationItem} = this.props;
    this.props.onTouch(true)
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
        newResource: null
      })
    }
  }

  handleShowSolving = () => {
    this.props.onTouch(true);
    const fixedValues = this.initFixedValues();

    this.setState({
      fixedValues,
      showSolving: true,
      newResource: null,
      newReference: null,
      newRefReference: null
    })
  }

  handleHideSolving = () => {
    this.props.onTouch(false)
    this.setState({
      showSolving: false,
      showNewForm: false,
      newResource: null,
      newReference: null,
      newRefReference: null
    })
  }

  handleDiscard = () => {
    const {modificationItem} = this.props;
    this.props.onTouch(false);
    const fixedValues = this.initFixedValues();
    this.setState({
      fixedValues,
      showSolving: modificationItem.fixed ? false : true,
      showNewForm: false,
      newResource: null,
      newReference: null,
      newRefReference: null
    });
    this.props.onDiscard()
  }
  
  renderFixed() {
    const {modificationItem} = this.props;
    const {field, fixedValues, fixedReferenceTable, unchangable, fixedStatus}= modificationItem;
    const fixedValue = values(fixedValues).join('|');
    const printValue = fixedValue.length ? fixedValue: 'none';
    const isNonchangableField = difference(NON_CHANGABLE_FIELDS, field.split('|')).length < NON_CHANGABLE_FIELDS.length

    return (
      <FieldContainer>
        <Control>

          <Label className="has-text-success">Fixed with value</Label>
          <p className="has-text-success">{printValue}</p>
          <Help isColor="success">
            {!isNonchangableField && <li>total {modificationItem.errors.length} rows updated</li>}
            {
              fixedReferenceTable && fixedReferenceTable.map((table)=> {
                return (
                  <li>{table.data.length} row(s) added to "{table.resourceName}" table</li>
                )
              })
            }
          </Help>
          {!this.state.showSolving && <Button isColor="info" isDisabled={unchangable} onClick={this.handleShowSolving}>Change this fix</Button>}
          {unchangable && fixedStatus === 'fixInOther' &&<Help isColor="success">found same value in other error, please fix it there</Help>}
          {unchangable && fixedStatus === 'autoFixed' &&<Help isColor="success">this foreign key error is auto fixed by previous format modification</Help>}
        </Control>
      </FieldContainer>
    )
  }

  renderSolving() {
    const {modificationItem, referenceTables, isCurrencyFixDisabled, schema} = this.props;

    const fieldDescriptor = schema.fields.find((f) => f.name === modificationItem.field)
    
    return (
      <div>
        {modificationItem.field === 'source' && !this.state.showNewForm && !this.state.newResource &&
          <FieldInput 
            isNonchangable={false}
            foreignKeys={schema.foreignKeys}
            fieldDescriptor={fieldDescriptor} 
            referenceTables={referenceTables}
            fixedValue={this.state.fixedValues[modificationItem.field]}
            fieldValue={this.state.fixedValues[modificationItem.field]}
            onClickCreate={this.handleClickCreate}
            onChange={this.handleSelectExist} />
        }
        {
          modificationItem.field !== 'source' &&
          <FieldContainer>
            <Control>
              {isCurrencyFixDisabled && <Help isColor="danger">Please fix year format error first</Help>}
              <Button isDisabled={isCurrencyFixDisabled} isColor='info' onClick={this.handleClickCreate}>Create new item</Button>
            </Control>
          </FieldContainer>  
        }
      </div>
      )
  }

  render() {
    const {modificationItem, foreignKeyField, descriptor, referenceTables, isModificationTouched} = this.props;
    const {value, message, field}= modificationItem;
    const resourceName = foreignKeyField.reference.resource;  
    const referenceFieldResource = descriptor.resources.find((resource) => resource.name === resourceName);
    
    const getLayoutColumns = (field) => {
      switch(field) {
        case 'reporting':
        case 'partner':
        case 'currency|year|reporting':
          return '1/4'
        default:
          return '1/2'
      }
    }
    const validateFixedValues = () => {
      if (field.split('|').length > 0) {
        const invalidValue = values(this.state.fixedValues).filter((fixedValue) => !fixedValue);
        return invalidValue.length > 0;
      } else return !this.state.fixedValues[field];
    }
    const mapFieldValue = (field, value) => {
      return field.split('|').map((f, index) => {
        return  {
          value: value.split('|')[index],
          field: f,
          referenceField: typeof(foreignKeyField.reference.fields) === 'string' ?
            foreignKeyField.reference.fields:foreignKeyField.reference.fields[index]
        }
      })
    }
    const originalValues = mapFieldValue(field, value);

    const layoutColumn = getLayoutColumns(modificationItem.field);

    const isSubmitDisabled = validateFixedValues();

    return (
      <div style={{height: '60vh'}}>
        <form>
          <Columns>
            <Column isSize={layoutColumn}>
              <FieldContainer>
                <Label>Original value of "{field}":</Label>
                {/* <Input value={value} disabled /> */}
                <div className="has-text-danger">{value}</div>
                <Help isColor="danger">{message}</Help>
              </FieldContainer>
              {!this.state.showSolving && modificationItem.fixed && this.renderFixed()}
              {this.state.showSolving && this.renderSolving()}
            </Column>
            { this.state.showNewForm && 
              <Column className='new-resource-form' style={{flex: 'auto'}}>
                <ReferenceResourceForm 
                  originalValues={originalValues}
                  descriptor={descriptor}
                  resourceDescriptor={referenceFieldResource}
                  referenceTables={referenceTables}
                  onCancel={this.handleCancel}
                  onAddNew={this.handleAddNewResource} />
              </Column>
            }
            {
              this.state.newResource && 
              <Column>
                <NewResourceRow resource={this.state.newResource}/>
                <Button onClick={this.handleClickCreate}>Reset</Button>
              </Column>
            }
            {
              this.state.newReference && 
              <Column>
                <NewResourceRow resource={this.state.newReference}/>
              </Column>
            }
            {
              this.state.newRefReference && 
              <Column>
                <NewResourceRow resource={this.state.newRefReference}/>
              </Column>
            }
          </Columns>
          {
            this.state.showSolving &&
            <FieldContainer isGrouped>
              {/* {
                modificationItem.fixed &&
                <Control>
                  <Button isColor="info" onClick={this.handleHideSolving}>Cancel</Button>
                </Control>
              } */}
              {
                isModificationTouched &&
                <Control>
                  <Button isColor="info" onClick={this.handleDiscard}>Discard modification</Button>
                </Control>
              }
              <Control>
                <Button isColor="info" isDisabled={isSubmitDisabled} onClick={this.handleSubmitForm}>Confirm this fix</Button>
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