import React from 'react';

import {
  HelpPin,
} from 'design-workshop';

const OverviewTable = ({
  className,
  groupedErrors,
}) => {
  const columnNames = ['', 'Field', 'Value', 'Rows']

  return (
    <div style={{position: 'relative', width: '100%', height: '70vh'}}>
      
      <div className={`action-table ${className}`}>
        <div className={'action-table-header'}>
          {
            columnNames.map((columnName, index) => {
              return (
                <div key={index} className="table-cell">
                  <span className={columnName === 'Value' ? 'has-text-danger': 'has-text-black'}>{columnName}</span>
                </div>
              );
            })
          }
        </div>
        <div className={'action-table-main'}>
          {
            groupedErrors.map((item, errorIndex) => {
              const {field, errors} = item;
              return (
                <div key={errorIndex} className="table-row">
                  {
                    columnNames.map((columnName, columnIndex) => {
                      switch (columnIndex) {
                        case 0:
                        default:
                          return (<div key={columnIndex} className="table-cell">{errorIndex + 1}</div>)
                        case 1:
                          return (<div key={columnIndex} className="table-cell">{field}</div>);
                        case 2:
                          return (
                            <div key={columnIndex} className="table-cell">
                              <span className="has-text-danger">{errors[0].value || 'null'}</span>
                              <HelpPin>{errors[0].message}</HelpPin>
                            </div>);
                        case 3:
                          return (<div key={columnIndex} className="table-cell">{errors.length}</div>);
                      }
                    })
                  }
                </div>
              )
            })
          }
        </div>
        {/* <div className={'action-table-footer'}></div> */}
      </div>
    </div>
  );
}

export default OverviewTable