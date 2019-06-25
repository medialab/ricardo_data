import {uniq} from 'lodash';

export const getEnumOptions = (enumList, required=false) => {
  const options = enumList.map((e) => {
    return {
      label: e,
      value: e
    }
  })
  if (!required) {
    options.unshift({
      value: '',
      label: 'none'
    })
  }
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