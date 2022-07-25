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

import i18n from '../locales/i18n';

/**
 * The util function is used to generate validation errors related to the sensors.
 * @param {Object} errors
 * should contain row, column, errorMessage and value.
 * Outputs '[Row: {row}][Column: {column}] {Error message} {Optional value}'
 */
export const generateErrorFormatForSensors = (errors) =>
  errors.reduce((acc, e) => {
    acc += i18n.t('FARM_MAP.BULK_UPLOAD_SENSORS.DOWNLOAD_FILE.ROW', {
      row: e?.row ?? '',
      column: e?.column ?? '',
      errorMessage: e?.errorMessage ?? '',
      value: e?.value ?? '',
    });
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
    errorText += i18n.t('FARM_MAP.BULK_UPLOAD_SENSORS.DOWNLOAD_FILE.PARTIAL_SUCCESS_TOP_TEXT');
    errorText += success.reduce((acc, e, i) => {
      const ending = i === success.length - 1 ? '\n\n' : ', ';
      acc += e + ending;
      return acc;
    }, '');
    errorText += i18n.t('FARM_MAP.BULK_UPLOAD_SENSORS.DOWNLOAD_FILE.PARTIAL_SUCCESS_BOTTOM_TEXT');
  }
  errorText += i18n.t('FARM_MAP.BULK_UPLOAD_SENSORS.DOWNLOAD_FILE.SOME_ERRORS');
  errorText += generateErrorFormatForSensors(errors);
  return errorText;
};

/**
 * Creates and downloads the file for sensors upload errors.
 * @param {String} downloadFileName
 * @param {Array<Object>} errors
 * @param {("validation"|"claim"|"generic")} errorType
 * @param {Array<String>} success
 */
export const createSensorErrorDownload = (downloadFileName, errors, errorType, success = []) => {
  const element = document.createElement('a');
  let formattedError;
  switch (errorType) {
    case 'validation':
      formattedError = generateErrorFormatForSensors(errors);
      break;
    case 'claim':
      formattedError = generateClaimSensorErrorFile(errors, success);
      break;
    case 'generic':
      formattedError = i18n.t('FARM_MAP.BULK_UPLOAD_SENSORS.DOWNLOAD_FILE.DEFAULT');
      break;
    default:
      formattedError = i18n.t('FARM_MAP.BULK_UPLOAD_SENSORS.DOWNLOAD_FILE.DEFAULT');
  }
  const file = new Blob([formattedError], {
    type: 'text/plain',
  });
  element.href = URL.createObjectURL(file);
  element.download = downloadFileName;
  document.body.appendChild(element);
  element.click();
};

const columnExpections = {
  fr: {
    'types_Ã_relevÃ©': 'types_à_relevé',
    'tempÃ©rature': 'température',
  },
  pt: {
    'tipos_de_mediÃ§Ã£o': 'tipos_de_medição',
    'teor_de_Ã¡gua_no_solo': 'teor_de_água_no_solo',
    'potencial_de_Ã¡gua_do_solo': 'potencial_de_água_do_solo',
  },
  es: {
    'tipos_de_mediciÃ³n': 'tipos_de_medición',
    'potencial_hÃ­drico_del_suelo': 'potencial_hídrico_del_suelo',
  },
};

/**
 * Creates a new array with corrected langauge values
 * @param {Array<String>} downloadFileName
 */
export const handleLangaugeKeywordExecptions = (keyArr, language) => {
  return (
    (columnExpections[language] &&
      keyArr.reduce((acc, cv) => {
        cv = cv.replace(/\s/g, '').trim();
        const isPresent = Object.keys(columnExpections[language]).some((key) => key === cv);
        if (isPresent) acc.push(columnExpections[language][cv]);
        else acc.push(cv);
        return acc;
      }, [])) ??
    keyArr
  );
};

export const SENSOR_BULK_UPLOAD_FAIL = 'SENSOR_BULK_UPLOAD_FAIL';
