import React from 'react';
import {difference} from 'lodash';

import {
  
} from 'design-workshop';

const HeaderValidation = ({
  headerNames,
  fieldNames
}) => {
  const diffLength = headerNames.length - fieldNames.length;
  let diff;
  if (diffLength > 0) {
    diff = difference(headerNames, fieldNames);
  }
  else diff = difference(fieldNames, headerNames);

  return (
    <div>
      {diff.length === diffLength && diffLength > 0 &&
        <div className="has-text-danger">
          <span>Extra headers - </span>
          { diff.map((field) => {
             return <span>"{field}" </span>
            })
          }
        </div>
      } 
      {diff.length === Math.abs(diffLength) && diffLength < 0 &&
        <div className="has-text-danger has-text-weight-bold">
          <span>Missing headers - </span>
          { diff.map((field) => {
             return <span>"{field}" </span>
            })
          }
        </div>
      }
      <div style={{
        display: 'flex',
        flexFlow: 'row nowrap',
      }}>
        <div>
          <div className="has-text-weight-bold">headers</div>
          {
            headerNames.map((columnName, index) => {
              return (
                <div key={index}>
                  {columnName}
                </div>
              );
            })
          }
        </div>
        <div>
          <div className="has-text-weight-bold">schema fields</div>
          {
            fieldNames.map((columnName, index) => {
              return (
                <div key={index}>
                  {columnName}
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

export default HeaderValidation;