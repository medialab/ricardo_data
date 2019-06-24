import React from 'react';
import {
  Button,
  Field,
  Label,
  Input,
  Control,
  Help
} from 'design-workshop';

class GithubLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      token: '',
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

  handleLogin = () => {
    this.props.onSubmitLogin({
      username: this.state.username,
      token: this.state.token
    })
  }

  render() {
    return (
      <div>
        <Field>
          <Label>username:</Label>
          <Control>
            <Input value={this.state.username} onChange={this.handleChangeUser} />
          </Control>
        </Field>
        <Field>
          <Label>personal access token:</Label>
          <Control>
            <Input type="password" value={this.state.token} onChange={this.handleChangeToken} />
          </Control>
        </Field>
        <Field>
          <Button isColor="info" onClick={this.handleLogin}>Login</Button>
        </Field>
      </div>
    )
  }
}

export default GithubLogin;