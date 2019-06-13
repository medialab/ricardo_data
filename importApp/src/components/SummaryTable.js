import React from 'react';
import {isNull, values} from 'lodash';
import {
  HelpPin,
  Button,
} from 'design-workshop';

const SummaryTable = ({
  className,
  modificationList,
  onSelectError
}) => {
  const columnNames = ['', 'Field', 'Value', 'Rows', ''];
  const isYearFormatError = modificationList.find((item)=> item.field === 'year' && !item.fixed)

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
              const {field, errors, value, message, fixed, fixedValues} = item;
              const fixedValue = values(fixedValues).join('|');
              const handleSelectError = () => {
                onSelectError(errorIndex)
              }

              const isCurrencyFixDisabled = item.field === 'currency|year|reporting' && isYearFormatError;

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
                              <span className="has-text-danger">{isNull(value)? 'none' : value }</span>
                              {fixed && <span className="has-text-success">->{fixedValue === ''?'none': fixedValue}</span>}
                              <HelpPin>{message}</HelpPin>
                            </div>);
                        case 3:
                          return (
                            <div key={columnIndex} className="table-cell">
                              <span className={item.fixed ? 'has-text-success': 'has-text-black'}>{errors.length} {item.fixed && 'rows affected'}</span>
                              <br/>
                              {
                                item.fixedReferenceTable && 
                                <span className="has-text-success">new row added to "{item.fixedReferenceTable}" table</span>
                              }
                            </div>);
                        case 4:
                          return (
                            <div key={columnIndex} className="table-cell">
                              <Button isDisabled={isCurrencyFixDisabled} isOutlined isColor={item.fixed? 'success': 'info'} onClick={handleSelectError}>{item.fixed ? 'fixed': 'fix error'}</Button>
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