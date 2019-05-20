import React from 'react';
import {connect} from 'react-redux';

import {Button} from 'design-workshop';
import TableForm from '../../components/TableForm';
import {validateResource} from '../../redux/modules/repoData';

class SchemaValidation extends React.Component {

  render() { 
    const {descriptor, schemaFeedback} = this.props;
    const {data} = descriptor.resources[0];
    const columnsNames = data[0];
    
    const getRow = () => {
      const row = data[schemaFeedback.rowNumber -1];
      const errorColNums = schemaFeedback.messages.map((item) => item.columnNumber)
      const result = columnsNames.map((name, index)=> {
        if (errorColNums.indexOf(index + 1) !== -1) {
          const {message} = schemaFeedback.messages.find((item) => item.columnNumber === (index + 1))
          return {
            name, 
            value: row[index],
            valid: false,
            message
          }
        }
        else {
          return {
            name, 
            value: row[index],
            valid: true
          }
        }
      });
      return result;
    }
    // const getTable = () => {
    //   const output = []
    //   schemaFeedback.messages.forEach((error)=>{
    //     const row = data[error.rowNumber -1]
    //     const tableRow = columnsNames.reduce((res, name, index) => {
    //       return {...res, [name]: row[index]}
    //     }, {});
    //     output.push(tableRow)
    //   });
    //   return output;
    // }
  const handleClick = () => this.props.validateResource({descriptor, relations: true})
    return (
      <div>
        <Button onClick={handleClick}>
          validate new flow
        </Button>
        {
          schemaFeedback && !schemaFeedback.valid && schemaFeedback.messages.length > 0 &&
          <div style={{position: 'relative', width: '100%', height: '70vh'}}>
            <span>{schemaFeedback.messages.length} errors found</span>
            <TableForm
              values={getRow()}
              errorColNumber={schemaFeedback.messages[0].columnNumber -1}
              columnNames={columnsNames} />
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  descriptor: state.repoData && state.repoData.descriptor,
  schemaFeedback: state.repoData && state.repoData.schemaFeedback
})


export default connect(mapStateToProps, {validateResource})(SchemaValidation);