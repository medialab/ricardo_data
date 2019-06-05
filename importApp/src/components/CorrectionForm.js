import React from 'react';
import {
  Button,
  Field,
  Label,
  Control,
  Input,
  Help,
  Select
} from 'design-workshop'

const CorrectionForm = ({
  className,
  modificationItem,
  schema,
  onSubmitForm
}) => {
  const {field, errorType, value, message}= modificationItem;
  let fieldSchema = schema.fields.find((f) => f.name === field)
  // if (errorType === 'ERROR_FORMAT') {
  //   fieldSchema = schema.fields.find((f) => f.name === field)
  // }
  if (errorType === 'ERROR_FOREIGN_KEY') {
    const foreignKeys = schema.foreignKeys.find((f) => f.fields.indexOf(field) !==-1)
    fieldSchema = {
      ...fieldSchema,
      foreignKeys
    }
  }
  return (
    <div style={{height: '40vh'}}>
      <form style={{width: '20rem', padding: '1rem'}}>
        <div>
          <span className="has-text-weight-bold">{fieldSchema.name}</span>
          <span style={{
              display: 'inline-block',
              marginLeft: '.5rem',
              paddingLeft: '.5rem',
              paddingRight: '.5rem',
              background: 'white',
              flex: 1,
            }}>{value}</span>
        </div>
        <Help isColor="danger">{message}</Help>
        {
          (!fieldSchema.constraints || !fieldSchema.constraints.enum) &&
          <Field>
            <Label>{fieldSchema.name}</Label>
            <Control>
              <Input placeholder="Text Input" value="" />
            </Control>
            {/* <Help isColor="success"></Help> */}
          </Field>
        }
        
        {
          fieldSchema.constraints && fieldSchema.constraints.enum &&
          <Field>
            <Label>Select value from:</Label>
            <Control>
              <Select>
                {
                  fieldSchema.constraints.enum.map((item, index) => {
                    return (
                      <option key={index}>{item}</option>
                    )
                  })
                }
              </Select>
            </Control>
          </Field>
        }

        <Field isGrouped>
          <Control>
            <Button isColor="primary" onClick={onSubmitForm}>Submit</Button>
          </Control>
        </Field>
      </form>
    </div>
  );
}

export default CorrectionForm;