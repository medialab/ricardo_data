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
import GithubLogin from './GithubLogin';

const LoginModal = ({
  isActive,
  closeModal,
  onSubmitLogin
}) => {
  return (
    <div>
      <Modal isActive={isActive}>
        <ModalBackground onClick={closeModal} />
        <ModalContent>
          <GithubLogin onSubmitLogin={onSubmitLogin} />
        </ModalContent>
        <ModalClose onClick={closeModal} />
      </Modal>
    </div>
  )
}

export default LoginModal