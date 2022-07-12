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

import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useSelector } from 'react-redux';
import { bulkSensorsUploadSliceSelector } from '../../../../containers/bulkSensorUploadSlice';
import { createSensorErrorDownload } from '../../../../util/sensor';

// Required Fields
const SENSOR_NAME = 'Name';
const SENSOR_LATITUDE = 'Latitude';
const SENSOR_LONGITUDE = 'Longitude';
const SENSOR_READING_TYPES = 'Reading_types';

// Optional Fields
const SENSOR_EXTERNAL_ID = 'External_ID';
const SENSOR_DEPTH = 'Depth';
const SENSOR_BRAND = 'Brand';
const SENSOR_MODEL = 'Model';

const SOIL_MOISTURE_CONTENT = 'soil_moisture_content';
const WATER_POTENTIAL = 'water_potential';
const TEMPERATURE = 'temperature';

const requiredReadingTypes = [SOIL_MOISTURE_CONTENT, WATER_POTENTIAL, TEMPERATURE];

const requiredFields = [SENSOR_NAME, SENSOR_LATITUDE, SENSOR_LONGITUDE, SENSOR_READING_TYPES];
const templateFields = [
  ...requiredFields,
  SENSOR_EXTERNAL_ID,
  SENSOR_DEPTH,
  SENSOR_BRAND,
  SENSOR_MODEL,
];

export function useValidateBulkSensorData(onUpload, t) {
  const bulkSensorsUploadResponse = useSelector(bulkSensorsUploadSliceSelector);
  const [disabled, setDisabled] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [sheetErrors, setSheetErrors] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const fileInputRef = useRef(null);
  const [translatedUploadErrors, setTranslatedUploadErrors] = useState([]);

  const validationFields = [
    {
      errorMessage: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_NAME'),
      mask: /^[a-zA-Z0-9 .-/!@#$%^&*)(]{1,100}$/,
      columnName: SENSOR_NAME,
    },
    {
      errorMessage: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_LATITUDE'),
      mask: /^(\+|-)?(?:90(?:(?:.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:.[0-9]{1,30})?))$/,
      columnName: SENSOR_LATITUDE,
    },
    {
      errorMessage: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_LONGITUDE'),
      mask: /^(\+|-)?(?:180(?:(?:.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:.[0-9]{1,30})?))$/,
      columnName: SENSOR_LONGITUDE,
    },
    {
      errorMessage: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_READING_TYPES'),
      columnName: SENSOR_READING_TYPES,
      validate(rowNumber, columnName, value) {
        if (typeof value !== 'string') return;
        const inputReadingTypes = value.trim().split(',');
        if (!inputReadingTypes.length) return;
        const invalidReadingTypes = inputReadingTypes.reduce((acc, fieldName) => {
          if (!requiredReadingTypes.includes(fieldName.trim())) {
            acc.push(fieldName.trim());
          }
          return acc;
        }, []);
        if (!invalidReadingTypes.length) return;
        return {
          row: rowNumber,
          column: columnName,
          errorMessage: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_READING_TYPES'),
          value: invalidReadingTypes.join(','),
        };
      },
    },
  ];

  useEffect(() => {
    if (!disabled) setDisabled(0);
    else setDisabled(bulkSensorsUploadResponse.loading ? -1 : 1);
  }, [bulkSensorsUploadResponse?.loading]);

  // bulkSensorsUploadResponse?.validationErrors from store updates the sheetErrors
  // the sheetErrors will be used as single source of truth to show validation
  // errors on the modal frontend.
  useEffect(() => {
    let validationErrorsResponseList = bulkSensorsUploadResponse?.validationErrors || [];
    if (validationErrorsResponseList.length) {
      const sheetErrorResponse = {
        sheetName: 'API_ERROR_SHEET',
        errors: [],
      };
      sheetErrorResponse.errors = validationErrorsResponseList.reduce((acc, validationError) => {
        acc.push({
          column: validationError?.errorColumn ?? '',
          errorMessage: '',
          row: validationError?.line ?? '',
          value: '',
        });
        return acc;
      }, []);
      setSheetErrors([sheetErrorResponse]);
    }
  }, [bulkSensorsUploadResponse?.validationErrors]);

  useEffect(() => {
    if (bulkSensorsUploadResponse?.errorSensors.length > 0) {
      setErrorCount((curr) => curr + bulkSensorsUploadResponse.errorSensors.length);
    }
    const translatedErrors = bulkSensorsUploadResponse?.errorSensors.map((e) => {
      return {
        row: e.row,
        column: e.column,
        errorMessage: e.variables ? t(e.translation_key, e.variables) : t(e.translation_key),
      };
    });

    setTranslatedUploadErrors(translatedErrors);
  }, [bulkSensorsUploadResponse?.errorSensors]);

  useEffect(() => {
    if (bulkSensorsUploadResponse?.defaultFailure) {
      setErrorCount(1);
    }
  }, [bulkSensorsUploadResponse?.defaultFailure]);

  const validateExcel = (rows) => {
    let errors = [];
    for (let i = 0; i < rows.length; i++) {
      let element = rows[i];
      for (const validationField of validationFields) {
        const COLUMN = validationField.columnName;
        if (COLUMN.length) {
          let validColumn = true;
          if (validationField.hasOwnProperty('mask')) {
            validColumn = validationField.mask.test(element[COLUMN]);
          }
          if (!validColumn) {
            errors.push({
              row: i + 2,
              column: COLUMN,
              errorMessage: validationField.errorMessage,
              value: element[COLUMN],
            });
          } else {
            // find for other errors after regex check.
            if (validationField.hasOwnProperty('validate')) {
              const validationError = validationField.validate(i + 2, COLUMN, element[COLUMN]);
              if (validationError) {
                errors.push(validationError);
              }
            }
          }
        }
      }
    }
    return errors;
  };

  const onUploadClicked = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return;
    onUpload(file);
  };

  const checkRequiredColumnsArePresent = (sensorObject = {}) => {
    const missingColumns = requiredFields.filter(
      (fieldName) => !Object.keys(sensorObject).includes(fieldName),
    );
    return missingColumns.length
      ? [
          {
            row: 1,
            column: missingColumns.join(','),
            errorMessage: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.MISSING_COLUMNS'),
            value: '',
          },
        ]
      : [];
  };

  const checkCSVFileRowLimit = (sensorList = []) =>
    sensorList.length > 100
      ? [
          {
            row: 1,
            column: 'N/A',
            errorMessage: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.FILE_ROW_LIMIT_EXCEEDED'),
            value: '',
          },
        ]
      : [];

  const handleSelectedFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setSelectedFileName(file?.name);
      const data = await file.arrayBuffer();
      const workBook = XLSX.read(data);
      const sheetErrorList = [];
      let totalErrorCount = 0;
      for (const singleSheet of workBook.SheetNames) {
        const sheetError = {
          sheetName: singleSheet,
        };
        const worksheet = workBook.Sheets[singleSheet];
        // sheet_to_json always return array.
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        let errors = [];
        errors = checkRequiredColumnsArePresent(jsonData[0]);
        if (!errors.length) {
          errors = checkCSVFileRowLimit(jsonData);
        }
        if (!errors.length) {
          errors = validateExcel(jsonData);
        }

        totalErrorCount += errors.length;
        sheetError.errors = errors;
        sheetError.errors.length && sheetErrorList.push(sheetError);
      }
      setErrorCount(totalErrorCount);
      setSheetErrors(sheetErrorList);
      setDisabled(() => (totalErrorCount === 0 ? 1 : 0));
    } catch (err) {
      console.error(err);
    }
  };

  const onShowErrorClick = (e) => {
    if (bulkSensorsUploadResponse?.validationErrors.length || sheetErrors.length) {
      const inputFile = fileInputRef.current.files[0];
      if (inputFile) {
        const downloadFileName = `${inputFile.name.replace(/.csv/, '')}_errors.txt`;
        createSensorErrorDownload(downloadFileName, sheetErrors[0].errors, 'validation', t);
      }
    } else if (bulkSensorsUploadResponse?.defaultFailure) {
      createSensorErrorDownload('sensor-upload-outcomes.txt', null, 'generic', t);
    } else {
      createSensorErrorDownload(
        'sensor-upload-outcomes.txt',
        translatedUploadErrors,
        'claim',
        t,
        bulkSensorsUploadResponse?.success,
      );
    }
  };

  const onTemplateDownloadClick = () => {
    const element = document.createElement('a');
    const file = new Blob([templateFields.join(',')], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'Add-sensors-to-LiteFarm.csv';
    document.body.appendChild(element);
    element.click();
  };

  return {
    onUploadClicked,
    handleSelectedFile,
    onShowErrorClick,
    onTemplateDownloadClick,
    disabled,
    selectedFileName,
    fileInputRef,
    errorCount,
  };
}
