export const pick = (object = {}, properties = []) => {
  const result = {};
  for (const key of properties) {
    if (object.hasOwnProperty(key)) {
      result[key] = object[key];
    }
  }
  return result;
};
