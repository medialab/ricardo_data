import React from 'react';

import {
  Button,
  Card,
  Modal,
  ModalBackground,
  ModalContent,
  ModalCard,
  ModalCardBody,
  ModalCardFooter,
  ModalClose
} from 'design-workshop';
import ModificationSummary from './ModificationSummary';

const ConfirmationModal = ({
  flows,
  referenceTables,
  onSelectDiscard, 
  onSelectDownload,
  isActive,
  closeModal
}) => {

  const handleAction = (id, e) => {
    switch(id) {
      case 'cacnel':
      default: 
        closeModal(); 
        break;
      case 'download':
        onSelectDownload();
        break;
      case 'discard':
        onSelectDiscard();
        break;
    }
  }
  return (
    <div>
          <Modal isActive={isActive}>
            <ModalBackground onClick={closeModal} />
            <ModalContent>
              {/* {referenceTables.referenceTables && <ModificationSummary referenceTables={referenceTables} />} */}
              <Card 
                // title="Modal title" 
                bodyContent="Leave this step, you might lost your modification?"
                onAction = {handleAction}
                footerActions={[
                  {label: 'Download', id: 'download', isColor: 'success' }, 
                  {label: 'Discard', id: 'discard', isColor: 'danger'},
                  {label: 'Cancel', id: 'cancel', isColor: 'info'},
                ]} />
            </ModalContent>
            {/* <ModalCard>
              <ModalCardBody>
                You might lost your modification? 
              </ModalCardBody>
              <ModalCardFooter>
                  <Button isColor='success'>Download file to local</Button>
                  <Button isColor="danger">Discard</Button>
                  <Button isColor='info'>Cancel</Button>
              </ModalCardFooter>
            </ModalCard> */}
            <ModalClose onClick={closeModal} />
          </Modal>
    </div>
  )
}

export default ConfirmationModal