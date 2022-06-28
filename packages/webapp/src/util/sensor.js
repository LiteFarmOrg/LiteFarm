/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

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

/**
 * Generates the error string related to partial successes claiming sensors from ensemble.
 * @param {Array<Object>} errors
 * @param {Array<String>} success
 * @return {string}
 */
export const generateClaimSensorErrorFile = (errors, success) => {
  let errorText = '';
  if (success.length > 0) {
    errorText +=
      'The following sensors in your file uploaded successfully or already exist on your farm:\n\n';
    errorText += success.reduce((acc, e, i) => {
      const ending = i === success.length - 1 ? '\n\n' : ', ';
      acc += e + ending;
      return acc;
    }, '');
    errorText +=
      'They should now be visible on your farm map. These sensors will be ignored in future uploads.\n\n';
  }
  errorText += 'Unfortunately, there were some errors with your upload:\n\n';
  errorText += generateErrorFormatForSensors(errors);
  return errorText;
};

/**
 * Creates and downloads the file for sensors upload errors.
 * @param {String} downloadFileName
 * @param {Array<Object>} errors
 * @param {Boolean} isValidationError
 * @param {Array<String>} success
 */
export const createSensorErrorDownload = (
  downloadFileName,
  errors,
  isValidationError,
  success = [],
) => {
  const element = document.createElement('a');
  const formattedError = isValidationError
    ? generateErrorFormatForSensors(errors)
    : generateClaimSensorErrorFile(errors, success);
  const file = new Blob([formattedError], {
    type: 'text/plain',
  });
  element.href = URL.createObjectURL(file);
  element.download = downloadFileName;
  document.body.appendChild(element);
  element.click();
};

export const SENSOR_BULK_UPLOAD_FAIL = 'SENSOR_BULK_UPLOAD_FAIL';
