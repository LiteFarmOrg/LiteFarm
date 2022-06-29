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

export const createSensorErrorDownload = (downloadFileName, errors) => {
  const element = document.createElement('a');
  const formattedError = generateErrorFormatForSensors(errors);
  const file = new Blob([formattedError], {
    type: 'text/plain',
  });
  element.href = URL.createObjectURL(file);
  element.download = downloadFileName;
  document.body.appendChild(element);
  element.click();
};

export const SENSOR_BULK_UPLOAD_FAIL = 'SENSOR_BULK_UPLOAD_FAIL';
