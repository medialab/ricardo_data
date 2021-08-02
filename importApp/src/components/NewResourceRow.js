import React from 'react';
import {
  Label,
} from 'design-workshop'
const NewResourceRow = ({resource}) => { 
  const {data, resourceName} = resource;
  return (
    <div style={{height: '40vh', overflow:'auto'}}>
      <h3>{data.length} row(s) add to "{resourceName}" table</h3>
      {
        data.map((row)=> {
          return (
            Object.keys(row).map((key) => {
              return (
                <div key={key}>
                  <Label>{key}:</Label>
                  <p>{row[key]}</p>
                </div>
              )
            })
          )
        })
      }
    </div>
  );
}

export default NewResourceRow;