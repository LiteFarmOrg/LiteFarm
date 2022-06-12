import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const SENSOR_EXTERNAL_ID = 'External_ID';
const SENSOR_NAME = 'Name';
const SENSOR_LATITUDE = 'Latitude';
const SENSOR_LONGITUDE = 'Longitude';
const SENSOR_READING_TYPES = 'Reading_types';

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
];

const validationFields = [
  {
    errorMessage: 'Invalid external id, must be between 1 and 20 characters.',
    /* eslint-disable-next-line */
    mask: /^[a-zA-Z0-9 \.\-\/!@#$%^&*)(]{1,20}$/,
    columnName: SENSOR_EXTERNAL_ID,
  },
  {
    errorMessage: 'Invalid sensor name, must be between 1 and 100 characters.',
    /* eslint-disable-next-line */
    mask: /^[a-zA-Z0-9 \.\-\/!@#$%^&*)(]{1,100}$/,
    columnName: SENSOR_NAME,
  },
  {
    errorMessage: 'Invalid latitude value, must be between -90 and 90. and fewer than 10 decimals.',
    /* eslint-disable-next-line */
    mask: /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,30})?))$/,
    columnName: SENSOR_LATITUDE,
  },
  {
    errorMessage:
      'Invalid longitude value, must be between -180 and 180. and fewer than 10 decimals.',
    /* eslint-disable-next-line */
    mask: /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,30})?))$/,
    columnName: SENSOR_LONGITUDE,
  },
  {
    errorMessage:
      'Invalid reading type detected, valid values include: soil_moisture_content, water_potential, temperature.',
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
        errorMessage: 'The reading types contains invalid values',
        value: invalidReadingTypes.join(','),
      };
    },
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
            errorMessage: validationField.type,
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
            column: missingColumns.join(','),
            errorMessage: 'Columns are required/missing',
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

  const generateADownload = (s) => {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  const onShowErrorClick = (e) => {
    const inputfFile = fileInputRef.current.files[0];
    if (inputfFile) {
      const element = document.createElement('a');
      const worksheet = XLSX.utils.json_to_sheet(sheetErrors[0].errors);
      var csv = XLSX.utils.sheet_to_csv(worksheet);

      const file = new Blob([generateADownload(csv)], {
        type: 'text/plain',
      });
      element.href = URL.createObjectURL(file);
      element.download = 'validation-errors.txt';
      document.body.appendChild(element);
      element.click();
    }
  };

  return {
    onUploadClicked,
    handleSelectedFile,
    onShowErrorClick,
    disabled,
    selectedFileName,
    fileInputRef,
    errorCount,
  };
}
