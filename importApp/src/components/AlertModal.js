import React from 'react';

import {
  Button,
  Card,
  Modal,
  ModalBackground,
  ModalContent,
  ModalClose
} from 'design-workshop';


const AlertModal = ({
  isActive,
  closeModal
}) => {
  return (
    <Modal isActive={isActive}>
      <ModalBackground onClick={closeModal} />
      <ModalContent>
        <Card bodyContent="You have made a modification, please confirm your fix first?" />
      </ModalContent>
      <ModalClose onClick={closeModal} />
    </Modal>
  )
}

export default AlertModal