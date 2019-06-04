import React from 'react';

const ContextTable = ({
  className,
  flows,
  modificationItem
}) => {
  const columnNames = flows[0];
  const {errors, field} = modificationItem;

  return (
    <div style={{position: 'relative', width: '100%', height: '20vh'}}>
      <div className="has-text-danger">total {errors.length} affected rows</div>
      <div className={`action-table ${className}`}>
        <div className={'action-table-header'}>
          {
            columnNames.map((columnName, index) => {
              const errorColumn = field.indexOf(columnName) !== -1 ? true : false
              return (
                <div key={index} className="table-cell">
                  <span className={errorColumn ? 'has-text-danger': 'has-text-black'}>{columnName}</span>
                </div>
              );
            })
          }
        </div>
        <div className={'action-table-main'}>
            {
              errors.map((error, rowIndex) => {
                return (
                  <div key={rowIndex} className="table-row">
                    {
                      columnNames.map((columnName, columnIndex) => {
                        const errorColumn = field.indexOf(columnName) !== -1 ? true : false

                      return (
                        <div key={columnIndex} className="table-cell" style={{ wordBreak: 'break-all' }}>
                          <span className={errorColumn ? 'has-text-danger': 'has-text-black'}>
                            {flows[error.rowNumber - 1][columnIndex]}
                          </span>
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