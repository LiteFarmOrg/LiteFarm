import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const validationFields = [
  {
    type: 'Sensor id invalid, must be between 1 and 20 characters.',
    /* eslint-disable-next-line */
    mask: /^[a-zA-Z0-9 \.\-\/!@#$%^&*)(]{1,20}$/,
    columnName: 'ESID',
    required: true,
  },
  {
    type: 'Sensor name invalid, must be between 1 and 100 characters.',
    /* eslint-disable-next-line */
    mask: /^[a-zA-Z0-9 \.\-\/!@#$%^&*)(]{1,100}$/,
    columnName: 'Name',
    required: true,
  },
];

export function useValidateBulkSensorData(onUpload) {
  const [disabled, setDisabled] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState('');
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

  const validateFileUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (file) {
      const data = await file.arrayBuffer();
      const workBook = XLSX.read(data);
      const sheetErrors = [];
      let totalErrorCount = 0;
      for (const singleSheet of workBook.SheetNames) {
        const sheetError = {
          sheetName: singleSheet,
        };
        const worksheet = workBook.Sheets[singleSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const errors = validateExcel(jsonData);
        totalErrorCount += errors.length;
        sheetError.errors = errors;
        sheetErrors.push(sheetError);
      }
      console.log('totalErrorCount', totalErrorCount);
      console.log('sheetErrors', sheetErrors);
      if (!totalErrorCount) {
        onUpload(file);
      }
    }
  };

  const handleSelectedFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file?.name);
      setDisabled(false);
    }
  };

  return { validateFileUpload, handleSelectedFile, disabled, selectedFileName, fileInputRef };
}
