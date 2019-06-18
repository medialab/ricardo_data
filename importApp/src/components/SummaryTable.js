import React from 'react';
import {isNull, values, difference} from 'lodash';
import {
  HelpPin,
  Button,
} from 'design-workshop';
import {nonChangableFields} from '../constants'


const SummaryTable = ({
  className,
  modificationList,
  onSelectError
}) => {
  const columnNames = ['', 'Field', 'Value', 'Rows', ''];
  const yearFormatValues = modificationList
                            .filter((item)=> item.field === 'year' && !item.fixed)
                            .map((item) => ''+item.value);

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

              const isNonchangableField = difference(nonChangableFields, field.split('|')).length < nonChangableFields.length

              const handleSelectError = () => {
                onSelectError(errorIndex)
              }
              let isCurrencyFixDisabled = false;
              if (item.field === 'currency|year|reporting' && yearFormatValues.indexOf(item.value.split('|')[1]) !== -1) {
                isCurrencyFixDisabled = true
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
                              <span className="has-text-danger">{isNull(value)? 'none' : value }</span>
                              {fixed && <span className="has-text-success">->{fixedValue === ''?'none': fixedValue}</span>}
                              <HelpPin>{message}</HelpPin>
                            </div>);
                        case 3:
                          return (
                            <div key={columnIndex} className="table-cell">
                              <span className={item.fixed ? 'has-text-success': 'has-text-black'}>{errors.length} {item.fixed &&!isNonchangableField && 'rows affected'}</span>
                              <br/>
                              {
                                item.fixedReferenceTable && item.fixedReferenceTable.length &&
                                <div>
                                  { 
                                    item.fixedReferenceTable.map((table, index)=> {
                                      return (
                                        <span key={index} className="has-text-success">new row added to "{table.resourceName}" table</span>
                                      )
                                    })
                                  }
                                </div>
                                
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