import React from 'react';
import {
  Label,
} from 'design-workshop'
const NewResourceRow = ({resource}) => { 
  const {data, resourceName} = resource;
  return (
    <div style={{height: '40vh', overflow:'auto'}}>
      <h3>New row to "{resourceName}" table</h3>
      {Object.keys(data).map((key) => {
        return (
          <div>
            <Label>{key}:</Label>
            <p>{data[key]}</p>
          </div>
        )
      })}
    </div>
  );
}

export default NewResourceRow;