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
import parseSensorCsv from '@shared/validation/sensorCSV.js';
import { getLanguageFromLocalStorage } from '../../../../util/getLanguageFromLocalStorage';
import { languageCodes } from '../../../../hooks/useLanguageOptions';

const getSensorTranslations = async (language) => {
  try {
    // return english if language not supported
    if (!languageCodes.includes(language)) {
      throw `LiteFarm sensors does not currently support language ${language}`;
    }
    return await import(`../../../../../../shared/locales/${language}/sensorCSV.json`);
  } catch (error) {
    console.log(error);
    return await import('../../../../../../shared/locales/en/sensorCSV.json');
  }
};

export function useValidateBulkSensorData(onUpload, t) {
  const bulkSensorsUploadResponse = useSelector(bulkSensorsUploadSliceSelector);
  const [disabled, setDisabled] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [sheetErrors, setSheetErrors] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const fileInputRef = useRef(null);
  const [translatedUploadErrors, setTranslatedUploadErrors] = useState([]);
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');
  const [errorTypeCode, setErrorTypeCode] = useState(ErrorTypes.DEFAULT);
  const lang = getLanguageFromLocalStorage();

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
    if (bulkSensorsUploadResponse?.defaultFailure) {
      setErrorCount(1);
      setErrorTypeCode(ErrorTypes.INVALID_CSV);
      setUploadErrorMessage(t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_ERROR_MESSAGE'));
    }
  }, [bulkSensorsUploadResponse?.defaultFailure]);

  const onUploadClicked = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    onUpload(selectedFile);
  };

  const getFileExtension = (fileName) => fileName.split('.').pop();

  const handleSelectedFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileExtension = getFileExtension(file?.name);
      setSelectedFileName(file?.name);
      setSelectedFile(file);

      const fileString = await readFile(file);
      const translations = await getSensorTranslations(lang);
      const { data, errors } = parseSensorCsv(fileString, lang, translations);

      const translatedErrors = translateErrors(errors);

      if (data.length >= 100) {
        translatedErrors.push({
          row: 1,
          column: 'N/A',
          errorMessage: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.FILE_ROW_LIMIT_EXCEEDED'),
          value: '',
        });
      }

      if (fileExtension !== 'csv') {
        setErrorTypeCode(ErrorTypes.INVALID_FILE_TYPE);
        setUploadErrorMessage(t('FARM_MAP.BULK_UPLOAD_SENSORS.INVALID_FILE_TYPE'));
      } else if (errors.length !== 0) {
        setErrorTypeCode(ErrorTypes.INVALID_CSV);
        setUploadErrorMessage(t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_ERROR_MESSAGE'));
      } else if (data.length === 0) {
        setErrorTypeCode(ErrorTypes.EMPTY_FILE);
        setUploadErrorMessage(t('FARM_MAP.BULK_UPLOAD_SENSORS.EMPTY_FILE_UPLOAD_ERROR_MESSAGE'));
      }

      const newErrorCount = data.length === 0 ? 1 : translatedErrors.length;
      setErrorCount(newErrorCount);
      setSheetErrors(translatedErrors);
      setDisabled(() => (newErrorCount === 0 ? 1 : 0));
    } catch (err) {
      console.error(err);
    }
  };

  const onShowErrorClick = async (errorCode) => {
    if (errorCode === 2) {
      await onTemplateDownloadClick();
      return;
    }
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

  const onTemplateDownloadClick = async () => {
    const element = document.createElement('a');
    const { CSV_HEADER_TRANSLATIONS } = await getSensorTranslations(lang);
    const file = new Blob([`${'\ufeff'}${Object.values(CSV_HEADER_TRANSLATIONS).join(',')}`], {
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
