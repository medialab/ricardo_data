import React from 'react';
import {groupBy, sortBy} from 'lodash';

import {RANKED_FIELDS} from '../constants'
import { file } from '@babel/types';

const OverviewTable = ({
  className,
  collectedErrors,
}) => {
  const columnNames = ['Field', 'Error Type', 'Error Overview']
  const orderedErrors = sortBy(collectedErrors, (field) => {
    return RANKED_FIELDS[field.name]
  })
  return (
    <div style={{position: 'relative', width: '100%', height: '70vh'}}>
      
      <div className={`action-table ${className}`}>
        <div className={'action-table-header'}>
          {
            columnNames.map((columnName, index) => {
              return (
                <div key={index} className="table-cell">
                  {columnName}
                </div>
              );
            })
          }
        </div>
        <div className={'action-table-main'}>
          {
            orderedErrors.map((field, rowIndex) => {
              // const field = collectedErrors[errorKey];
              const totalErrors = field.errors.length;
              const groupedErrors = groupBy(field.errors, (v)=> {return v.value});
              const distinctErrors = Object.keys(groupedErrors).length;
              return (
                <div key={rowIndex} className="table-row">
                  {
                    columnNames.map((columnName, columnIndex) => {
                      let missingRows = [];
                      if (field.errorType === 'ERROR_FORMAT' && (field.name==='reporting' || field.name === 'partner')) {
                        missingRows = field.errors.map((error) => error.rowNumber);
                      }
                      if(columnIndex === 0) return (<div key={columnIndex} className="table-cell">{field.name}</div>)
                      else if(columnIndex === 1) return (<div key={columnIndex} className="table-cell">{field.errorType}</div>)
                      else return (
                        <div key={columnIndex} className="table-cell">
                          <span>{distinctErrors} different invalid values, {totalErrors} rows affected in total</span>
                          {missingRows.map((rowNumber)=> {
                            return (<li className="has-text-danger">missing value in row {rowNumber}</li>)
                          })}
                        </div>
                      )
                      
                    })
                  }
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

export default OverviewTable