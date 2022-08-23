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
import { useSelector } from 'react-redux';
import { bulkSensorsUploadSliceSelector } from '../../../../containers/bulkSensorUploadSlice';
import { createSensorErrorDownload } from '../../../../util/sensor';
import { ErrorTypes } from './constants';
import parseSensorCsv from '../../../../../../shared/validation/sensorCSV.js';
import { getLanguageFromLocalStorage } from '../../../../util/getLanguageFromLocalStorage';

export function useValidateBulkSensorData(onUpload, t) {
  const bulkSensorsUploadResponse = useSelector(bulkSensorsUploadSliceSelector);
  const [disabled, setDisabled] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [sheetErrors, setSheetErrors] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const fileInputRef = useRef(null);
  const [translatedUploadErrors, setTranslatedUploadErrors] = useState([]);
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');
  const [errorTypeCode, setErrorTypeCode] = useState(ErrorTypes.DEFAULT);
  const lang = getLanguageFromLocalStorage();

  // Required Fields
  const SENSOR_NAME = t('FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_FIELDS.NAME');
  const SENSOR_LATITUDE = t('FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_FIELDS.LATITUDE');
  const SENSOR_LONGITUDE = t('FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_FIELDS.LONGITUDE');
  const SENSOR_READING_TYPES = t('FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_FIELDS.READING_TYPES');

  // Optional Fields
  const SENSOR_EXTERNAL_ID = t('FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_FIELDS.SENSOR_EXTERNAL_ID');
  const SENSOR_DEPTH = t('FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_FIELDS.DEPTH');
  const SENSOR_BRAND = t('FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_FIELDS.BRAND');
  const SENSOR_MODEL = t('FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_FIELDS.MODEL');

  const requiredFields = [SENSOR_NAME, SENSOR_LATITUDE, SENSOR_LONGITUDE, SENSOR_READING_TYPES];
  const templateFields = [
    ...requiredFields,
    SENSOR_EXTERNAL_ID,
    SENSOR_DEPTH,
    SENSOR_BRAND,
    SENSOR_MODEL,
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
      const translatedErrors = translateErrors(bulkSensorsUploadResponse?.validationErrors);
      setErrorCount(translatedErrors.length);
      setSheetErrors(translatedErrors);
      setErrorTypeCode(ErrorTypes.INVALID_CSV);
      setUploadErrorMessage(t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_ERROR_MESSAGE'));
    }
  }, [bulkSensorsUploadResponse?.validationErrors]);

  useEffect(() => {
    if (bulkSensorsUploadResponse?.errorSensors.length > 0) {
      setErrorCount((curr) => curr + bulkSensorsUploadResponse.errorSensors.length);
      const translatedErrors = translateErrors(bulkSensorsUploadResponse?.errorSensors);
      setTranslatedUploadErrors(translatedErrors);
      setErrorTypeCode(ErrorTypes.INVALID_CSV);
      setUploadErrorMessage(t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_ERROR_MESSAGE'));
    }
  }, [bulkSensorsUploadResponse?.errorSensors]);

  const translateErrors = (errors) => {
    return errors?.map((e) => {
      return {
        row: e.row,
        column: e.column,
        errorMessage: e.variables ? t(e.translation_key, e.variables) : t(e.translation_key),
        value: e?.value ?? '',
      };
    });
  };

  useEffect(() => {
    // console.log(bulkSensorsUploadResponse)
    if (bulkSensorsUploadResponse?.defaultFailure) {
      setErrorCount(1);
      setErrorTypeCode(ErrorTypes.INVALID_CSV);
      setUploadErrorMessage(t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_ERROR_MESSAGE'));
    }
  }, [bulkSensorsUploadResponse?.defaultFailure]);

  const onUploadClicked = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return;
    onUpload(file);
  };

  const handleSelectedFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setSelectedFileName(file?.name);

      const fileString = await readFile(file);

      const { data, errors } = parseSensorCsv(fileString, lang);

      const translatedErrors = translateErrors(errors);

      if (data.length === 100) {
        translatedErrors.push({
          row: 1,
          column: 'N/A',
          errorMessage: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.FILE_ROW_LIMIT_EXCEEDED'),
          value: '',
        });
      }

      if (errors.length !== 0) {
        setErrorTypeCode(ErrorTypes.INVALID_CSV);
        setUploadErrorMessage(t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_ERROR_MESSAGE'));
      } else if (data.length === 0) {
        setErrorTypeCode(ErrorTypes.EMPTY_FILE);
        setUploadErrorMessage(t('FARM_MAP.BULK_UPLOAD_SENSORS.EMPTY_FILE_UPLOAD_ERROR_MESSAGE'));
      }

      setErrorCount(translatedErrors.length);
      setSheetErrors(translatedErrors);
      setDisabled(() => (translatedErrors.length === 0 ? 1 : 0));
    } catch (err) {
      console.error(err);
    }
  };

  const onShowErrorClick = (e) => {
    if (sheetErrors.length) {
      const inputFile = fileInputRef.current.files[0];
      if (inputFile) {
        const downloadFileName = `${inputFile.name.replace(/.csv/, '')}_errors.txt`;
        createSensorErrorDownload(downloadFileName, sheetErrors, 'validation');
      }
    } else if (bulkSensorsUploadResponse?.defaultFailure) {
      createSensorErrorDownload('sensor-upload-outcomes.txt', null, 'generic');
    } else {
      createSensorErrorDownload(
        'sensor-upload-outcomes.txt',
        translatedUploadErrors,
        'claim',
        bulkSensorsUploadResponse?.success,
      );
    }
  };

  const onTemplateDownloadClick = () => {
    const element = document.createElement('a');
    const file = new Blob([`${'\ufeff'}${templateFields.join(',')}`], {
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
    uploadErrorMessage,
    errorTypeCode,
  };
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
