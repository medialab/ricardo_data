import React from 'react';

const ModificationSummary = ({
  referenceTables
}) => {
  const {tables, originalLength} = referenceTables;
  let updatedTables = []
  Object.keys(tables).forEach((name) => {
    if (tables[name].length !== originalLength[name]) {
      updatedTables.push({
        name,
        updatedRows: tables[name].slice(originalLength[name])
      })
    }
  });
  return (
    <div>
      <h3>updated reference tables</h3>
      {
        updatedTables.map((item)=>{
          return (
            <p>"{item.name}" table: {item.updatedRows.length} row(s)</p>
          )
        })
      }
    </div>
  );
}

export default ModificationSummary;