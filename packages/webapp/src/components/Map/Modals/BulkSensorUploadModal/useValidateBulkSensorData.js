import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const SENSOR_EXTERNAL_ID = 'External_ID';
const SENSOR_NAME = 'Name';
const SENSOR_LATITUDE = 'Latitude';
const SENSOR_LONGITUDE = 'Longitude';
const SENSOR_READING_TYPES = 'Reading_types';
const DEPTH = 'Depth';

const SOIL_WATER_CONTENT = 'soil_water_content';
const SOIL_WATER_POTENTIAL = 'soil_water_potential';
const TEMPERATURE = 'temperature';

const requiredReadingTypes = [SOIL_WATER_CONTENT, SOIL_WATER_POTENTIAL, TEMPERATURE];

const requiredFields = [
  SENSOR_EXTERNAL_ID,
  SENSOR_NAME,
  SENSOR_LATITUDE,
  SENSOR_LONGITUDE,
  SENSOR_READING_TYPES,
  DEPTH,
];

const validationFields = [
  {
    type: 'Sensor id invalid, must be between 1 and 20 characters.',
    /* eslint-disable-next-line */
    mask: /^[a-zA-Z0-9 \.\-\/!@#$%^&*)(]{1,20}$/,
    columnName: SENSOR_EXTERNAL_ID,
  },
  {
    type: 'Sensor name invalid, must be between 1 and 100 characters.',
    /* eslint-disable-next-line */
    mask: /^[a-zA-Z0-9 \.\-\/!@#$%^&*)(]{1,100}$/,
    columnName: SENSOR_NAME,
  },
  {
    type: 'Invalid format for latitude',
    /* eslint-disable-next-line */
    mask: /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,30})?))$/,
    columnName: SENSOR_LATITUDE,
  },
  {
    type: 'Invalid format for longitude',
    /* eslint-disable-next-line */
    mask: /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,30})?))$/,
    columnName: SENSOR_LONGITUDE,
  },
  {
    type: 'Invalid format for Reading_types',
    /* eslint-disable-next-line */
    mask: /^\s*(?:\w+\s*,\s*){2,}(?:\w+\s*)$/,
    columnName: SENSOR_READING_TYPES,
    validate(rowNumber, columnName, value) {
      if (typeof value !== 'string') return;
      const inputReadingTypes = value.split(',');
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
        type: 'The reading types contains invalid values',
        value: invalidReadingTypes,
      };
    },
  },
  {
    type: 'Invalid depth, must be a decimal value between 0 and 500.',
    /* eslint-disable-next-line */
    mask: /^(\d{0,2}(\.\d{1,6})?|100(\.00?)?)$/,
    columnName: DEPTH,
  },
];

export function useValidateBulkSensorData(onUpload) {
  const [disabled, setDisabled] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [sheetErrors, setSheetErrors] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const fileInputRef = useRef(null);

  const validateExcel = (rows) => {
    let errors = [];
    for (let i = 0; i < rows.length; i++) {
      let element = rows[i];
      for (const validationField of validationFields) {
        const COLUMN = validationField.columnName;
        const validColumn = validationField.mask.test(element[COLUMN]);
        if (!validColumn) {
          errors.push({
            row: i + 2,
            column: COLUMN,
            type: validationField.type,
            value: element[COLUMN],
          });
        } else {
          // find for other errors
          if (validationField.hasOwnProperty('validate')) {
            const validationError = validationField.validate(i + 2, COLUMN, element[COLUMN]);
            if (validationError) {
              errors.push(validationError);
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
    if (file) {
      onUpload(file);
    }
  };

  const checkRequiredColumnsArePresent = (sensorObject) => {
    const missingColumns = requiredFields.filter(
      (fieldName) => !Object.keys(sensorObject).includes(fieldName),
    );
    return missingColumns.length
      ? [
          {
            row: 1,
            column: missingColumns,
            type: 'Columns are required/missing',
            value: '',
          },
        ]
      : [];
  };

  const handleSelectedFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
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
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          let errors = [];
          if (jsonData?.length) {
            const missingColumnsErrors = checkRequiredColumnsArePresent(jsonData[0]);
            errors = missingColumnsErrors.length ? missingColumnsErrors : validateExcel(jsonData);
            totalErrorCount += errors.length;
            sheetError.errors = errors;
            sheetErrorList.push(sheetError);
          }
        }
        console.log('totalErrorCount', totalErrorCount);
        console.log('sheetErrorList', sheetErrorList);
        setErrorCount(totalErrorCount);
        setSheetErrors(sheetErrorList);
        setDisabled(!!totalErrorCount);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return {
    onUploadClicked,
    handleSelectedFile,
    disabled,
    selectedFileName,
    fileInputRef,
    errorCount,
  };
}
