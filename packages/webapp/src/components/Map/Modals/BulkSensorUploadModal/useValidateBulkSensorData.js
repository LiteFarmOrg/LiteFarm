import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const validationFields = [
  {
    type: 'Sensor id invalid, must be between 1 and 20 characters.',
    /* eslint-disable-next-line */
    mask: /^[a-zA-Z0-9 \.\-\/!@#$%^&*)(]{1,20}$/,
    columnName: 'ESID',
  },
  {
    type: 'Sensor name invalid, must be between 1 and 100 characters.',
    /* eslint-disable-next-line */
    mask: /^[a-zA-Z0-9 \.\-\/!@#$%^&*)(]{1,100}$/,
    columnName: 'Name',
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
        let validColumn = validationField.mask.test(element[COLUMN]);
        if (!validColumn) {
          errors.push({
            row: i + 2,
            column: COLUMN,
            type: validationField.type,
            value: element[COLUMN],
          });
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
          const errors = validateExcel(jsonData);
          totalErrorCount += errors.length;
          sheetError.errors = errors;
          sheetErrorList.push(sheetError);
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
