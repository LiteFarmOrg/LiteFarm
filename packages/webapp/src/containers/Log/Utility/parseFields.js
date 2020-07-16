const parseFields = (formValues, fields) => {

  let selectedFields = [];
  // hacky way to let harvestLog submit a field which contains only one value right now
  if(!Array.isArray(formValues['field']))   {
    selectedFields.push({ field_id: formValues['field']['value'] })
    return selectedFields
  }
  //
  if (formValues.field[0].value === 'all') {
    fields.forEach((f) => {
      selectedFields.push({ field_id: f.field_id });
    })
  } else {
    formValues.field.forEach((f) => {
      selectedFields.push({ field_id: f.value });
    });
  }
  return selectedFields;
};

export default parseFields;
