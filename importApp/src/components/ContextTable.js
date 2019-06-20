import React from 'react';

const ContextTable = ({
  className,
  flows,
  modificationItem
}) => {
  const columnNames = flows[0];
  const {errors, field, value, fixedValues} = modificationItem;
  return (
    <div style={{position: 'relative', width: '100%', height: '20vh'}}>
      <div className={`action-table ${className}`}>
        <div className={'action-table-header'}>
          {
            columnNames.map((columnName, index) => {
              const errorColumn = field.split('|').indexOf(columnName) !== -1 ? true : false
              return (
                <div key={index} className="table-cell">
                  <span className={errorColumn ? 'has-text-danger': 'has-text-black'}>{columnName}</span>
                </div>
              );
            })
          }
        </div>
        <div className={'action-table-main'} style={{height: '100%'}}>
            {
              errors.map((error, rowIndex) => {
                return (
                  <div key={rowIndex} className="table-row">
                    {
                      columnNames.map((columnName, columnIndex) => {
                        const errorColumn = field.split('|').indexOf(columnName) !== -1 ? true : false
                        let fixedValue;
                        const errorColumnIndex = field.split('|').indexOf(columnName);
                        let originalValue = (''+value).split('|')[errorColumnIndex];
                        if (columnName === 'year' && errorColumnIndex===1) {
                          originalValue = flows[error.rowNumber - 1][columnIndex]
                        }
                        if (fixedValues && errorColumn) {
                          fixedValue = fixedValues[columnName].length === 0 ? 'none' : fixedValues[columnName];
                        }
                      return (
                        <div key={columnIndex} className="table-cell" style={{ wordBreak: 'break-all' }}>
                          <span className={errorColumn ? 'has-text-danger': 'has-text-black'}>
                            {errorColumn ? originalValue: flows[error.rowNumber - 1][columnIndex]}
                          </span>
                          {
                            fixedValue && 
                              <span  className="has-text-success"> ->{fixedValue}</span>
                          }
                        </div>
                      );
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

export default ContextTable;