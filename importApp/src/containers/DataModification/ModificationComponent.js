import React from 'react';
import ContextTable from '../../components/ContextTable'
import FormatCorrection from '../../components/FormatCorrection';
import ForeignkeyCorrection from '../../components/ForeignkeyCorrection';

const ModificationComponent = ({
  className,
  flows,
  schema,
  modificationItem,
  modificationIndex,
  onSubmitModification
}) => {
  const handleSubmitModification = (fixedValue) => {
    return onSubmitModification({
      fixedValue,
      index: modificationIndex
    })
  }
  const getDescriptor = () => {
    const {field}= modificationItem;
    const descriptor = schema.fields.find((f) => f.name === field)
    return descriptor;
  }

  return (
    <div>
      <div>
        {
          modificationItem.errorType === 'ERROR_FORMAT' &&
          <FormatCorrection 
            descriptor={getDescriptor()} 
            modificationItem={modificationItem}
            modificationIndex={modificationIndex}
            onSubmitForm={handleSubmitModification} 
          /> 
        }
         {
          modificationItem.errorType === 'ERROR_FOREIGN_KEY' &&
          <ForeignkeyCorrection 
            descriptor={getDescriptor()} 
            modificationItem={modificationItem}
            modificationIndex={modificationIndex}
            onSubmitForm={handleSubmitModification} 
          /> 
        }
        <ContextTable flows={flows} modificationItem={modificationItem} />
      </div>
    </div>
  );
}

export default ModificationComponent;