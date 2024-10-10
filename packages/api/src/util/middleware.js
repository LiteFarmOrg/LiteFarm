// Utils
// Checks an array has more than one truthy value
export const hasMultipleValues = (values) => {
  const nonNullValues = values.filter(Boolean);
  return nonNullValues.length > 1;
};

// Checks an array of object keys against object -- at least one of the properties is defined
export const oneExists = (keys, object) => {
  return keys.some((key) => key in object);
};

// Checks an array for at least one truthy value
export const oneTruthy = (values) => values.some((value) => !!value);

// Sets falsy values to null for editing values that may have values for exclusive constraints -- does not handle zeros yet
export const setFalsyValuesToNull = (array, obj) => {
  for (const val of array) {
    obj[val] = obj[val] || null;
  }
};
