const parseFields = (formValues, locations) => {
  let selectedFields = [];
  // hacky way to let harvestLog submit a field which contains only one value right now
  if (!Array.isArray(formValues['field'])) {
    selectedFields.push({ location_id: formValues['field']['value'] });
    return selectedFields;
  }
  //
  if (formValues.field[0].value === 'all') {
    locations.forEach((f) => {
      selectedFields.push({ location_id: f.location_id });
    });
  } else {
    formValues.field.forEach((f) => {
      selectedFields.push({ location_id: f.value });
    });
  }
  return selectedFields;
};

export default parseFields;
