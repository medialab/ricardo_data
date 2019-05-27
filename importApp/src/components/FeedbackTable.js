import React from 'react';
import {
  Field,
  Control,
  Input,
  Help,
  HelpPin,
  ActionableTable
} from 'design-workshop';

class FeedbackTable extends React.Component {

  render() {
    const {
      className,
      columnNames = [],
      values = []} = this.props;
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
              values.map((obj, rowIndex) => {
                return (
                  <div key={rowIndex} className="table-row">
                    {
                      columnNames.map((columnName, index) => {
                      return (
                        <div key={index} className="table-cell" style={{ wordBreak: 'break-all', color: obj[columnName].valid ? 'black': 'red'}}>
                          {obj[columnName].value}
                          {!obj[columnName].valid && 
                            <HelpPin place='right'>{obj[columnName].errorType}:{obj[columnName].message}</HelpPin>
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
}

export default FeedbackTable