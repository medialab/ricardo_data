import React from 'react';
import {isNull} from 'lodash';
import {
  HelpPin,
  Button,
} from 'design-workshop';

const SummaryTable = ({
  className,
  modificationList,
  onSelectError
}) => {
  const columnNames = ['', 'Field', 'Value', 'Rows', '']

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
            modificationList.map((item, errorIndex) => {
              const {field, errors, value, message} = item;
              const handleSelectError = () => {
                onSelectError(errorIndex)
              }
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
                              <span className="has-text-danger">{isNull(value)? 'null' : value }</span>
                              <HelpPin>{message}</HelpPin>
                            </div>);
                        case 3:
                          return (<div key={columnIndex} className="table-cell">{errors.length}</div>);
                        case 4:
                          return (
                            <div key={columnIndex} className="table-cell">
                              <Button isOutlined isColor={item.fixed? 'success': 'info'} onClick={handleSelectError}>{item.fixed ? 'fixed': 'fix error'}</Button>
                            </div>
                          )
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

export default SummaryTable