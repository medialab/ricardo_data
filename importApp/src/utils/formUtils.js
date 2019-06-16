
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
