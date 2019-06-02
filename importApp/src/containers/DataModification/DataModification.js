import React from 'react';
import {connect} from 'react-redux';

import {groupBy, sortBy, values} from 'lodash';

import {
  Button,
} from 'design-workshop';

import {RANKED_FIELDS} from '../../constants'
import SummaryTable from '../../components/SummaryTable';

class DataModification extends React.Component {
  
  render() {
    const {schemaFeedback} = this.props;
    let orderedErrors;
    if (schemaFeedback.collectedErrors) {
      const errorsList = values(schemaFeedback.collectedErrors).reduce((res, item) => {
        return res.concat(item.errors)
      },[])
      const groupedErrorsList = values(groupBy(errorsList, (v) => v.field + v.value))
                                .map((errors)=> {
                                  return {
                                    field: errors[0].field,
                                    value: errors[0].value,
                                    errors
                                  }
                                })
      orderedErrors = sortBy(groupedErrorsList, (field) => {
        return RANKED_FIELDS[field.name]
      });
    }
    return (
      <div>
        {
          orderedErrors &&
          <SummaryTable groupedErrors={orderedErrors} />
        }
        <Button isColor="info">
          Start fix error
        </Button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  schemaFeedback: state.schemaValidation.schemaFeedback,
})

export default connect(mapStateToProps, {
})(DataModification);