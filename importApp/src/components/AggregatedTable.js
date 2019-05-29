import React from 'react';
import {groupBy} from 'lodash';
import {
  ActionCard,
  ActionCardHeader,
  ActionCardBody,
  HelpPin,
} from 'design-workshop';

const AggregatedTable = ({
  aggregatedErrors
}) => {
  const {foreignKeyErrors, formatErrors} = aggregatedErrors;
  const formatErrorColumns = Object.keys(formatErrors);
  const foreignKeyErrorColumns=  Object.keys(foreignKeyErrors);
  return (
    <div style={{position: 'relative', width: '100%', height: '70vh'}}>
      <div style={{
        position: 'absolute',
        overflowX: 'auto',
        display: 'flex',
        flexFlow: 'row nowrap',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        paddingBottom: '1rem'
      }}>
        {
          formatErrorColumns.map(columnName => {
            const field = formatErrors[columnName]
            const totalErrors = field.errors.length;
            const groupedErrors = groupBy(field.errors, (v)=> {return v.value});
            const required = (field.constraints && field.constraints.required && 'required') || '';
            return (
              <div
                key={columnName}
                style={{
                    background: 'red',
                    height: '100%',
                    minWidth: '10rem',
                    display: 'flex',
                    alignItems: 'stretch',
                    marginRight: '1rem'
                }}>
                <ActionCard style={{flex: 1}}>
                  <ActionCardHeader>
                    <td style={{width: '100%', display: 'inline-block'}}>
                      <b>{field.name} ({field.type} {required}) {totalErrors}</b>
                    </td>
                  </ActionCardHeader>
                  <ActionCardBody>
                    {
                      Object.keys(groupedErrors).map((key, index) => {
                          const item = groupedErrors[key]
                          return (
                              <tr key={index} style={{display:'flex', justifyContent:'space-between'}}>
                                <td>
                                  {item[0].value}
                                </td>
                                <td>
                                  {item.length}
                                  <HelpPin place='right'>{item[0].message}</HelpPin>
                                </td>
                            </tr>
                          );
                      })
                  }
                  </ActionCardBody>
                </ActionCard>
              </div>
            );
          })
        }
        {
          foreignKeyErrorColumns.map(columnName => {
            const field = foreignKeyErrors[columnName]
            const totalErrors = field.errors.length;
            const groupedErrors = groupBy(field.errors, (v)=> {return v.value});
            return (
              <div
                key={columnName}
                style={{
                    background: 'red',
                    height: '100%',
                    minWidth: '10rem',
                    display: 'flex',
                    alignItems: 'stretch',
                    marginRight: '1rem'
                }}>
                <ActionCard style={{flex: 1}}>
                  <ActionCardHeader>
                    <td style={{width: '100%', display: 'inline-block'}}>
                      <b>{field.name} (foreignKey) {totalErrors}</b>
                    </td>
                  </ActionCardHeader>
                  <ActionCardBody>
                    {
                      Object.keys(groupedErrors).map((key, index) => {
                          const item = groupedErrors[key]
                          return (
                              <tr key={index} style={{display:'flex', justifyContent:'space-between'}}>
                                <td>
                                  {item[0].value}
                                </td>
                                <td>
                                  {item.length}
                                  <HelpPin place='right'>{item[0].message}</HelpPin>
                                </td>
                            </tr>
                          );
                      })
                  }
                  </ActionCardBody>
                </ActionCard>
              </div>
            );
          })
        }
      </div>
    </div>
  )
}

export default AggregatedTable;