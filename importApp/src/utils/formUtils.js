import {sortedUniq, sortBy, countBy, toPairs, uniq} from 'lodash';

export const getEnumOptions = (enumList) => {
  const options = enumList.map((e) => {
    return {
      label: e,
      value: e
    }
  })
  return options
}

export const getOptions = ({tables, resourceName, referenceField, filter}) => {
  let values;
  if (filter) {
    values = tables[resourceName]
            .filter((item) => item[filter.field] !== filter.value)
            .map((item) => item[referenceField])
  }
  else {
    values = tables[resourceName].map((item) => item[referenceField])
  }
  const valuesCounted = countBy(values, v => v)
  const uniqValues = sortBy(toPairs(valuesCounted), ([k,v]) => -1*v).map(([k,v])=>k);

  return uniqValues.map((item) => {
    return {
      value: item,
      label: item
    }
  })
}