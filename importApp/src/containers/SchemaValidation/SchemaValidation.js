import React from 'react';
import {connect} from 'react-redux';

import {Button} from 'design-workshop';
import { 
  setStep
} from '../../redux/modules/ui';

// import FeedbackTable from '../../components/FeedbackTable';
// import AggregatedTable from '../../components/AggregatedTable';
import OverviewTable from '../../components/OverviewTable';

import {validateTable, getRelations, getForeignKeys, getSchema} from '../../redux/modules/schemaValidation';

class SchemaValidation extends React.Component {
  componentDidMount () {
    const {flows, schema, relations, schemaFeedback} = this.props;
    if (!schemaFeedback) {
      this.props.validateTable({source:flows, schema, relations});
    }
  }
  render() {
    const { schemaFeedback} = this.props;
    const handlePrevStep = () => this.props.setStep({id: '0'})
    const handleNextStep = () => this.props.setStep({id: '2'})

    return (
      <div>
        {
          schemaFeedback && schemaFeedback.status === 'loading' &&
          <span>{schemaFeedback.loader}</span>
        }
        {
          schemaFeedback && !schemaFeedback.valid && schemaFeedback.collectedErrors &&
          <div>
            <span className="has-text-danger has-text-weight-bold">
              {/* Found format errors in {Object.keys(schemaFeedback.collectedErrors.formatErrors).length} columns, ForeignKey errors in {Object.keys(schemaFeedback.collectedErrors.foreignKeyErrors).length} columns, {schemaFeedback.errors.length} rows */}
              Found errors in {schemaFeedback.errors.length} rows of {Object.keys(schemaFeedback.collectedErrors).length} fields
            </span>
            <OverviewTable collectedErrors={schemaFeedback.collectedErrors} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <Button 
                isColor="info" 
                onClick={handlePrevStep}>
                  Previous Step
              </Button>
              <Button 
                isColor="info"
                onClick={handleNextStep}>
                  Review Errors
              </Button>
            </div>
           
          </div>
        }
        {
          schemaFeedback && schemaFeedback.valid && <span className="has-text-success has-text-weight-bold">Flows data is valid</span>
        }
      </div>
    )
  }
}
const mapStateToProps = state => ({
  flows: state.flows.data,
  schema: state.schemaValidation.descriptor && getSchema(state),
  relations: state.schemaValidation.descriptor && getRelations(state),
  foreignKeys: state.schemaValidation.descriptor && getForeignKeys(state),
  schemaFeedback: state.schemaValidation.schemaFeedback
})

export default connect(mapStateToProps, {
  validateTable,
  setStep,
})(SchemaValidation);