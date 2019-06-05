import React from 'react';
import ContextTable from '../../components/ContextTable'
import CorrectionForm from '../../components/CorrectionForm';

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

  return (
    <div style={{height: '70vh'}}>
      <div>
        <CorrectionForm 
          schema={schema} 
          modificationItem={modificationItem}
          modificationIndex={modificationIndex}
          onSubmitForm={handleSubmitModification} 
        /> 
        <ContextTable flows={flows} modificationItem={modificationItem} />
      </div>
    </div>
  );
}

export default ModificationComponent;