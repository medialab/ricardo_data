import React from 'react';
import {groupBy, sortBy} from 'lodash';

import {RANKED_FIELDS} from '../constants'

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
                      let cellValue;
                      if(columnIndex === 0) cellValue = field.name;
                      else if(columnIndex === 1) cellValue = field.errorType;
                      else cellValue = `${distinctErrors} different invalid values, ${totalErrors} rows affected in total`
                      return (<div key={columnIndex} className="table-cell">{cellValue}</div>)
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