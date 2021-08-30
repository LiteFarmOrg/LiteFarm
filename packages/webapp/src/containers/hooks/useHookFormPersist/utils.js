import produce from 'immer';

export const getProcessedFormData = (data) => {
  return produce(data, (result) => {
    for (const fieldNameKey in result) {
      setOptionObjectToValueProperty(fieldNameKey, result);
    }
  });
};

const setOptionObjectToValueProperty = (fieldNameKey, formDataObject) => {
  const option = formDataObject[fieldNameKey];
  if (option?.hasOwnProperty('value') && option?.hasOwnProperty('label')) {
    formDataObject[fieldNameKey] = option.value;
  } else if (option instanceof Object) {
    for (const key in option) {
      setOptionObjectToValueProperty(key, formDataObject[fieldNameKey]);
    }
  }
};
