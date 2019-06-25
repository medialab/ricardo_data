import React from 'react';
import {
  Button,
  Field,
  Label,
  Input,
  Control,
  Help
} from 'design-workshop';

import {
  Modal,
  ModalBackground,
  ModalContent,
  ModalClose,
  ModalCard,
  ModalCardHeader,
  ModalCardTitle,
  Delete,
  ModalCardBody,
  ModalCardFooter
} from 'bloomer';

import {values} from 'lodash';

class GithubAuthModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      token: '',
      message: ''
    };
  }

  handleChangeUser = (event) => {
    this.setState({username: event.target.value});
  }

  handleChangeToken = (event) => {
    this.setState({
      token: event.target.value
    });
  }

  handleChangeMessage = (event) => {
    this.setState({
      message: event.target.value
    });
  }


  handleSubmit = () => {
    this.props.onSubmitAuth(this.state)
  }

  render() {
    const {isActive, isCommit, closeModal} = this.props;
    let invalidInput = !this.state.username || !this.state.token;
    
    if (isCommit) {
      invalidInput = values(this.state).find((value) => !value)
    }

    return (
      <Modal isActive={isActive}>
        <ModalBackground onClick={closeModal} />
        <ModalCard>
          <ModalCardBody>
            <Field>
              <Label>username*:</Label>
              <Control>
                <Input value={this.state.username} onChange={this.handleChangeUser} />
              </Control>
            </Field>
            <Field>
              <Label>personal access token*:</Label>
              <Control>
                <Input type="password" value={this.state.token} onChange={this.handleChangeToken} />
              </Control>
            </Field>
            {isCommit && 
              <Field>
                <Label>commit message*:</Label>
                <Control>
                  <Input value={this.state.message} onChange={this.handleChangeMessage} />
                </Control>
              </Field>
            }
            <Field>
              {invalidInput &&<Help isColor="danger">requied field is missing</Help>}
              <Button isDisabled={invalidInput} isColor="info" onClick={this.handleSubmit}>{isCommit ? 'Commit': 'Login'}</Button>
            </Field>
          </ModalCardBody>
        </ModalCard>
        <ModalClose onClick={closeModal} />
      </Modal>
    )
  }
}

export default GithubAuthModal;