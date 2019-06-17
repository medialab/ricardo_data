import React from 'react';
import {connect} from 'react-redux';

import {isEqual} from 'lodash';

import ContextTable from '../../components/ContextTable'
import FormatCorrection from '../../components/FormatCorrection';
import ForeignkeyCorrection from '../../components/ForeignkeyCorrection';

const ModificationComponent = ({
  className,
  flows,
  tables,
  descriptor,
  schema,
  modificationItem,
  modificationIndex,
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
          onSubmitForm={handleSubmitModification} 
        /> 
      }
      {
        modificationItem.errorType === 'ERROR_FOREIGN_KEY' &&
        <ForeignkeyCorrection 
          schema={schema}
          descriptor={descriptor}
          foreignKeyField={getForeignKeyField()}
          tables={tables}
          modificationItem={modificationItem}
          modificationIndex={modificationIndex}
          onSubmitForm={handleSubmitModification} 
        /> 
      }
      <ContextTable flows={flows} modificationItem={modificationItem} />
    </div>
  );
}

const mapStateToProps = state => ({
  descriptor: state.schemaValidation.descriptor,
  tables: state.tables.tables
});

export default connect(mapStateToProps)(ModificationComponent);