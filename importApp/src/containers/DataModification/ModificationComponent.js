import React from 'react';
import {connect} from 'react-redux';

import {isEqual} from 'lodash';

import ContextTable from '../../components/ContextTable'
import FormatCorrection from '../../components/FormatCorrection';
import ForeignkeyCorrection from '../../components/ForeignkeyCorrection';

const ModificationComponent = ({
  className,
  flows,
  referenceTables,
  descriptor,
  schema,
  isCurrencyFixDisabled,
  isModificationTouched,
  modificationItem,
  modificationIndex,
  onDiscard,
  onTouch,
  onSubmitModification,
}) => {
  const handleSubmitModification = (payload) => {
    const {fixedValues, fixedReferenceTable} = payload;
    return onSubmitModification({
      ...modificationItem,
      fixedValues,
      fixedReferenceTable,
      index: modificationIndex
    })
  }

  const getFieldDescriptor = () => {
    const {field}= modificationItem;
    const descriptor = schema.fields.find((f) => f.name === field)
    return descriptor;
  }

  const getForeignKeyField = () => {
    let foreignKeyField;
    if (modificationItem.field.indexOf('|') !== -1) {
      const fieldList = modificationItem.field.split('|');
      foreignKeyField = schema.foreignKeys.find((f) => isEqual(f.fields, fieldList));
    }
    else {
      foreignKeyField = schema.foreignKeys.find((f) => f.fields === modificationItem.field);
    }
    return foreignKeyField;
  }  
  return (
    <div>
      {
        modificationItem.errorType === 'ERROR_FORMAT' &&
        <FormatCorrection 
          fieldDescriptor={getFieldDescriptor()} 
          modificationItem={modificationItem}
          modificationIndex={modificationIndex}
          isModificationTouched={isModificationTouched}
          onDiscard={onDiscard}
          onTouch={onTouch}
          onSubmitForm={handleSubmitModification} 
        /> 
      }
      {
        modificationItem.errorType === 'ERROR_FOREIGN_KEY' &&
        <ForeignkeyCorrection 
          schema={schema}
          descriptor={descriptor}
          foreignKeyField={getForeignKeyField()}
          isCurrencyFixDisabled={isCurrencyFixDisabled}
          isModificationTouched={isModificationTouched}
          referenceTables={referenceTables}
          modificationItem={modificationItem}
          modificationIndex={modificationIndex}
          onDiscard={onDiscard}
          onTouch={onTouch}
          onSubmitForm={handleSubmitModification} 
        /> 
      }
      <ContextTable flows={flows} modificationItem={modificationItem} />
    </div>
  );
}

const mapStateToProps = state => ({
  descriptor: state.schemaValidation.descriptor,
  referenceTables: state.referenceTables.referenceTables
});

export default connect(mapStateToProps)(ModificationComponent);