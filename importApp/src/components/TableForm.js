import React from 'react';
import {
  Field,
  Control,
  Input,
  Help,
  HelpPin
} from 'design-workshop';

class TableForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  render() {
    const {
      className,
      columnNames = [],
      values = []} = this.props;
    const invalidColumns = values.filter((item) => !item.valid).map((item) => item.name)
    return (
      <div className={`action-table ${className}`}>
        <div className={'action-table-header'}>
          {
            columnNames.map((columnName, index) => {
              const invalid = invalidColumns.indexOf(columnName) !== -1;
              return (
                <div key={index}
                  className="table-cell"
                  style={{color: invalid ? 'red': 'black'}}>
                  {columnName}
                </div>
              );
            })
          }
        </div>
        <div className={'action-table-main'}>
          <div className="table-row">
            {
              values.map((obj, index) => {
                return (
                  <div key={index} 
                    className="table-cell"
                    style={{color: obj.valid ? 'black': 'red'}}>
                    {obj.valid && <span>{obj.value}</span>}
                    {!obj.valid &&
                      <Field>
                        <Control>
                          <Input isColor='danger' type="text" 
                            value={obj.value} />
                        </Control>
                        <Help isColor='danger'>{obj.message}</Help>
                      </Field>
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
// const TableForm = ({
//   onCellAction,
//   className = '',
//   columnNames = [],
//   values = [],
// }) => (
//   <div className={`action-table ${className}`}>
//     <div className={'action-table-header'}>
//       {
//         columnNames.map((columnName, index) => {
//           return (
//             <div key={index} className="table-cell">
//               {columnName}
//             </div>
//           );
//         })
//       }
//     </div>
//     <div className={'action-table-main'}>
//       <div className="table-row">
//         {
//           values.map((obj, index) => {
//             return (
//               <div key={index} className="table-cell" style={{color: obj.valid ? 'black': 'red'}}>
//                 {obj.value}
//               </div>
//             );
//           })
//         }
//      </div>
//     </div>
//   </div>
// );
export default TableForm;