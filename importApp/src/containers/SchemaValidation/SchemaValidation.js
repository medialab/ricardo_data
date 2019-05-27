import React from 'react';
import {connect} from 'react-redux';

import {Button} from 'design-workshop';
import FeedbackTable from '../../components/FeedbackTable';
import {validateTable, getRelations, getForeignKeys, getSchema} from '../../redux/modules/schemaValidation';

class SchemaValidation extends React.Component {
  componentDidMount () {
    const {flows, schema, schemaFeedback, relations} = this.props;
    this.props.validateTable({source:flows, schema, relations});
  }
  render() {
    const {flows, schema, schemaFeedback, relations} = this.props;

    const columnNames = flows[0]
    const errorTypes = ['ERROR_FORMAT', 'ERROR_UNIQUE_KEY', 'ERROR_FOREIGN_KEY'];

    const getFeedbackTable = () => {
      const output = []
      schemaFeedback.errors.forEach((error)=>{
        const row = flows[error.rowNumber -1]
        const tableRow = columnNames.reduce((res, name, index) => {
          let item = {
            name,
            value: row[index],
            valid: true
          };
          errorTypes.forEach((errorType) => {
            const selectedErrors = error.errors.find((err) => err.type === errorType)
            if (selectedErrors && selectedErrors.errors) {
              const selectedError = selectedErrors.errors.find((err) => {
                if (err.columnNumber) return err.columnNumber === index + 1;
                else if (err.columnName) return err.columnName[0] === name;
                else return;
              });
              if (selectedError) {
                item = {
                  ...item, 
                  valid: false, 
                  errorType,
                  message: selectedError.message,
                }
              }
            }
          })
          return {...res, [name]: item}
        }, {});
        output.push(tableRow)
      });
      return output;
    }
    return (
      <div>
        {
          schemaFeedback && schemaFeedback.status === 'loading' &&
          <span>{schemaFeedback.loader}</span>
        }
        {
          schemaFeedback && !schemaFeedback.valid && schemaFeedback.errors &&
          <div>
            <span>Found {schemaFeedback.errors.length} rows has errors</span>
            {<FeedbackTable
              values={getFeedbackTable()}
              columnNames={columnNames} /> }
          </div>
        }
        {
          schemaFeedback && schemaFeedback.valid && <span>Flows data is valid</span>
        }
      </div>
    )
  }
}
const mapStateToProps = state => ({
  flows: state.flows.data,
  schema: state.schemaValidation.descriptor && getSchema(state),
  relations: state.schemaValidation.descriptor && getRelations(state),
  foreignKeys: state.schemaValidation.descriptor && getForeignKeys(state),
  schemaFeedback: state.schemaValidation.schemaFeedback
})


export default connect(mapStateToProps, {validateTable})(SchemaValidation);