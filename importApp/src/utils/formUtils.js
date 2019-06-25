import {uniq} from 'lodash';

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
  const uniqValues = uniq(values);
  return uniqValues.map((item) => {
    return {
      value: item,
      label: item
    }
  })
}