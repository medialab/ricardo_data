import React from 'react';
import {connect} from 'react-redux';

import {Button} from 'design-workshop';
// import FeedbackTable from '../../components/FeedbackTable';
import AggregatedErrors from '../../components/AggregatedErrors';

import {validateTable, getRelations, getForeignKeys, getSchema} from '../../redux/modules/schemaValidation';

class SchemaValidation extends React.Component {
  componentDidMount () {
    const {flows, schema, schemaFeedback, relations} = this.props;
    this.props.validateTable({source:flows, schema, relations});
  }
  render() {
    const {flows, schema, schemaFeedback, relations} = this.props;
    const {fields} = schema;
    const columnNames = fields.map((field)=> field.name);

    const errorTypes = ['ERROR_FORMAT', 'ERROR_UNIQUE_KEY', 'ERROR_FOREIGN_KEY'];

    let errorsByColumn;
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
      return output
    }

    const getErrorsByColumn = () => {
      const output = fields.reduce((res, field) => {
        return {
          ...res,
          [field.name]: {
            ...field,
            errors: []
          }
        }
      }, {});
      schemaFeedback.errors.forEach((error)=>{
        const row = flows[error.rowNumber -1];
        const rowNumber = error.rowNumber;
        const selectedErrors = error.errors.find((err) => err.type === 'ERROR_FORMAT')
        columnNames.forEach((columnName, columnIndex) => {
          selectedErrors.errors.forEach((err) => {
            if (err.columnNumber === columnIndex + 1) {
              const item = {
                rowNumber,
                columnNumber: err.columnNumber,
                field: columnName,
                value: row[columnIndex] || 'null',
                message: err.message
              }
              output[columnName].errors.push(item)
            }
          })
        })
      });
      Object.keys(output).forEach((columnName) => {
        if(!output[columnName].errors.length) {
          delete output[columnName]
        }
      });
      return output;
    }
    if (schemaFeedback && schemaFeedback.errors) {
      errorsByColumn = getErrorsByColumn()
    }
    return (
      <div>
        {
          schemaFeedback && schemaFeedback.status === 'loading' &&
          <span>{schemaFeedback.loader}</span>
        }
        {
          schemaFeedback && !schemaFeedback.valid && errorsByColumn &&
          <div>
            <span className="has-text-danger has-text-weight-bold">Found format errors in {Object.keys(errorsByColumn).length} columns, {schemaFeedback.errors.length} rows</span>
            <AggregatedErrors
              values={errorsByColumn}
            />
          </div>
        }
        {
          schemaFeedback && schemaFeedback.valid && <span className="has-text-success has-text-weight-bold">Flows data is valid</span>
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