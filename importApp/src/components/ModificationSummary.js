import React from 'react';

import {
  Columns,
  Column
} from 'design-workshop';


const ModificationSummary = ({
  groupedFlows,
  updatedTables
}) => {

  return (
    <Columns>
      <Column>
        <strong>fixed flows table by source</strong>
        {
          Object.keys(groupedFlows).map((source) => {
            return (
              <p>{source}.csv</p>
            )
          })
        }
      </Column>
      <Column>
        <div>
          <strong>updated reference tables</strong>
          {
            updatedTables.map((item)=>{
              return (
                <p>"{item.name}" table: {item.updatedRows.length} row(s)</p>
              )
            })
          }
        </div>
      </Column>
    </Columns>
  );
}

export default ModificationSummary;