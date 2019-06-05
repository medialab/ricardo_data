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
  const {errors} = modificationItem;
  const handleSubmitModification = () => onSubmitModification(modificationIndex)

  return (
    <div style={{height: '70vh'}}>
      <div>
        <CorrectionForm schema={schema} modificationItem={modificationItem} onSubmitForm={handleSubmitModification} /> 
        <ContextTable flows={flows} modificationItem={modificationItem} />
      </div>
    </div>
  );
}

export default ModificationComponent;