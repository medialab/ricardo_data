/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';

import {
  Button,
  Card,
  Field,
  Control
} from 'design-workshop';

import {
  Modal,
  ModalBackground,
  ModalClose,
  ModalCard,
  ModalCardBody,
} from 'bloomer';

import {downloadTable} from '../utils/fileExporter';
const LeaveModificationModal = ({
  originalLength,
  referenceTables,
  onSelectDiscard, 
  onSelectDownload,
  isActive,
  closeModal
}) => {
  let updatedTables = [];
  if (referenceTables) {
    Object.keys(referenceTables).forEach((name) => {
      if (referenceTables[name].length !== originalLength[name]) {
        updatedTables.push({
          name,
          updatedRows: referenceTables[name].slice(originalLength[name])
        })
      }
    });
  }

  return (
    <Modal isActive={isActive}>
      <ModalBackground onClick={closeModal} />
      <ModalCard>
        <ModalCardBody>
          <div style={{
          textAlign:'center'
          }}>
              <h5 className="title is-5">Leave this step, you might lost your modification?</h5>
              {updatedTables.length>0 && <p>updated reference tables</p>}
              {
                updatedTables.map((table)=>{
                  const handleExportTable = () => {
                    downloadTable(referenceTables[table.name], table.name, 'csv')
                  }
                  return (
                    <div>
                      <a href="#" onClick={handleExportTable}>{table.name} table: {table.updatedRows.length} rows added</a>
                    </div>
                  )
                })
              }
              <Field isGrouped>
                <Control>
                  <Button onClick={onSelectDownload} isColor="success">Download fixed flows</Button>
                </Control>
                <Control>
                  <Button onClick={onSelectDiscard} isColor="danger">Discard</Button>
                </Control>
                <Control>
                  <Button onClick={closeModal} isColor="info">Cancel</Button>
                </Control>
            </Field>
            </div>
        </ModalCardBody>
      </ModalCard>
      <ModalClose onClick={closeModal} />
    </Modal>
  )
}

export default LeaveModificationModal