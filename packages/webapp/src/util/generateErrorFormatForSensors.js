/**
 * The util function is used to generate validation errors related the the sensors.
 * @param {Object} errors
 * should contain row, column, errorMessage and value.
 */
export const generateErrorFormatForSensors = (errors) =>
  errors.reduce((acc, e) => {
    acc += `[Row: ${e?.row ?? ''}][Column: ${e?.column ?? ''}] ${e?.errorMessage ?? ''} ${
      e?.value ?? ''
    }\n`;
    return acc;
  }, '');
