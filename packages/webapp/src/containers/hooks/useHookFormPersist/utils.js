import { cloneObject } from '../../../util';

export const getProcessedFormData = (data) => {
  const result = cloneObject(data);
  for (const fieldNameKey in result) {
    setOptionObjectToValueProperty(fieldNameKey, result);
  }
  return result;
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
