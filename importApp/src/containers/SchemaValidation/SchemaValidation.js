import React from 'react';
import {connect} from 'react-redux';

import {Button} from 'design-workshop';
// import FeedbackTable from '../../components/FeedbackTable';
import AggregatedTable from '../../components/AggregatedTable';

import {validateTable, getRelations, getForeignKeys, getSchema} from '../../redux/modules/schemaValidation';

class SchemaValidation extends React.Component {
  componentDidMount () {
    const {flows, schema, schemaFeedback, relations} = this.props;
    this.props.validateTable({source:flows, schema, relations});
  }
  render() {
    const {flows, schema, schemaFeedback, relations} = this.props;
    const {fields, foreignKeys} = schema;
    const columnNames = fields.map((field)=> field.name);
   
    const foreignKeysFields = foreignKeys.map((foreignKey) => joinFields(foreignKey.fields));
    const errorTypes = ['ERROR_FORMAT', 'ERROR_FOREIGN_KEY'];

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
      const formatErrors = fields.reduce((res, field) => {
        return {
          ...res,
          [field.name]: {
            ...field,
            errors: []
          }
        }
      }, {});
      const foreignKeyErrors = foreignKeys.reduce((res, foreignKey) => {
        const joinedFields = joinFields(foreignKey.fields);
        return {
          ...res,
          [joinedFields]: {
            name: joinedFields,
            ...foreignKey,
            errors: []
          }
        }
      }, {});
      schemaFeedback.errors.forEach((error)=>{
        const row = flows[error.rowNumber -1];
        const rowNumber = error.rowNumber;
        errorTypes.forEach((errorType) => {
          const selectedErrors = error.errors.find((err) => err.type === errorType)
          if(errorType === 'ERROR_FORMAT') {
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
                formatErrors[columnName].errors.push(item)
              }
            })
            })
          }
          else if (errorType === 'ERROR_FOREIGN_KEY') {
            foreignKeysFields.forEach((fields) => {
              selectedErrors.errors.forEach((err) => {
                // const fieldsList = fields.split('|');
                const joinedColumn = joinFields(err.columnName);
                if (joinedColumn === fields) {
                  const values = err.columnName.map((field) => {
                    const columnIndex = columnNames.indexOf(field);
                    return row[columnIndex]
                  })
                  const item = {
                    rowNumber,
                    field: err.columnName,
                    value: values.join('|'),
                    message: err.message
                  }
                  foreignKeyErrors[fields].errors.push(item)
                }
              })
            })
          }
        })
      });
      Object.keys(formatErrors).forEach((columnName) => {
        if(!formatErrors[columnName].errors.length) {
          delete formatErrors[columnName]
        }
      });
      Object.keys(foreignKeyErrors).forEach((columnName) => {
        if(!foreignKeyErrors[columnName].errors.length) {
          delete foreignKeyErrors[columnName]
        }
      });
      return {
        formatErrors,
        foreignKeyErrors,
      };
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
            <span className="has-text-danger has-text-weight-bold">
              Found format errors in {Object.keys(errorsByColumn.formatErrors).length} columns, ForeignKey errors in {Object.keys(errorsByColumn.foreignKeyErrors).length} columns, {schemaFeedback.errors.length} rows
            </span>
            <AggregatedTable
              aggregatedErrors={errorsByColumn}
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

const joinFields = (fields) => {
  if (typeof(fields) === 'string') return fields;
  else return fields.join('|');
}

export default connect(mapStateToProps, {validateTable})(SchemaValidation);