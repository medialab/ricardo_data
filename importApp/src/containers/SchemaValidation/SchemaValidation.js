import React from 'react';
import {connect} from 'react-redux';
import {Package} from 'datapackage';

import {Button} from 'design-workshop';

class SchemaValidation extends React.Component {
  constructor(props) {
    super(props);
    this.mockupDescriptor = this.mockupDescriptor.bind(this)
  }
  
  async validate() {
    const { descriptor } = this.props; 
    const dataPackage = await Package.load(descriptor)
    const resource = dataPackage.getResource('flows')
    const data = await resource.read() 
    console.log(data)
  }

  render() { 
    const handleClick = () => this.validate()
    return (
      <Button onClick={handleClick}>
        validate new flow
      </Button>
    )
  }
}

const mapStateToProps = state => ({
  descriptor: state.repoData && state.repoData.descriptor
})


export default connect(mapStateToProps)(SchemaValidation);