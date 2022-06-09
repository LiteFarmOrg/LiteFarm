import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

export function useValidateBulkSensorData() {
  const [disabled, setDisabled] = useState(false);
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
    {
      type: 'Invalid format for lat_long',
      // mask: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*,\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
      /* eslint-disable-next-line */
      mask: /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))\s*,\s*(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/,
      columnName: 'Lat_long',
      required: true,
    },
    {
      type: 'Invalid format for Reading_types',
      /* eslint-disable-next-line */
      mask: /^\s*(?:\w+\s*,\s*){2,}(?:\w+\s*)$/,
      columnName: 'Reading_types',
      required: true,
    },
    {
      type: 'Invalid depth, must be a decimal value between 0 and 500.',
      /* eslint-disable-next-line */
      mask: /^(\d{0,2}(\.\d{1,6})?|100(\.00?)?)$/,
      columnName: 'Depth',
      required: true,
    },
    {
      type: 'Brand must be fewer than 100 characters.',
      /* eslint-disable-next-line */
      mask: /^[a-zA-Z,]{1,100}$/,
      columnName: 'Brand',
      required: true,
    },
    {
      type: 'Brand must be fewer than 100 characters.',
      /* eslint-disable-next-line */
      mask: /^[a-zA-Z,]{1,100}$/,
      columnName: 'Model',
      required: true,
    },
  ];

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
    const file = e.target.files[0];
    if (file) {
      const data = await file.arrayBuffer();
      const workBook = XLSX.read(data);
      const sheetErrors = [];
      for (const singleSheet of workBook.SheetNames) {
        const sheetError = {
          sheetName: singleSheet,
        };
        const worksheet = workBook.Sheets[singleSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const errors = validateExcel(jsonData);
        sheetError.errors = errors;
        sheetErrors.push(sheetError);
      }
      console.log('sheetErrors', sheetErrors);
      setDisabled(true);
    }
  };

  return { validateFileUpload, disabled };
}
