/**
 * Validator for a column in a CSV file.
 * @typedef {Object} Validator
 * @property {String} key - a key representing the column.
 * @property {function} parse - parses a cell in this column to a desired format.
 * @property {function} validate - validates the parsed data.
 * @property {boolean} required - indicates whether this field is valid.
 * @property {String} errorTranslationKey - the error translation key for invalid data in this column.
 */

/**
 * @typedef {Object} Translation
 * @property {Object} en - english translations.
 * @property {Object} es - spanish translations.
 * @property {Object} fr - french translations.
 * @property {Object} pt - portuguese translations.
 */

/**
 * Returns a mapping from translated header to validator index.
 * @param {String} lang - language preference of user who uploaded the CSV.
 * @param {Array<Validator>} validators
 * @param {Translation} headerTranslations - translations for each CSV header based on validator keys.
 */
const getHeaderToValidatorMapping = (lang, validators, headerTranslations) => {
  const mapping = {};
  validators.forEach((validator, index) => {
    mapping[headerTranslations[lang][validator.key]] = index;
  });
  return mapping;
};

/**
 * Parses the csv string into an array of objects and an array of any lines that experienced errors.
 * @param {String} csvString
 * @param {String} lang - language preference of user who uploaded the CSV.
 * @param {Array<Validator>} validators
 * @param {Translation} headerTranslations - translations for each CSV header based on validator keys.
 * @param {String} missingColumnsErrorKey - the error translation key for when required headers are missing.
 * @param {boolean} validateUniqueDataKeys - whether data keys should be validated for uniqueness.
 * @param {function} getDataKeyFromRow - a function that takes in a parsed row and returns the a key representing the data entry.
 * @param {String} delimiter
 * @returns {Object<data: Array<Object>, errors: Array<Object>>}
 */

const parseCsv = (
  csvString,
  lang,
  validators,
  headerTranslations,
  missingColumnsErrorKey = 'MISSING_COLUMNS',
  validateUniqueDataKeys = true,
  getDataKeyFromRow = (r) => r[validators[0].key],
  delimiter = ',',
) => {
  // regex checks for delimiters that are not contained within quotation marks
  const regex = new RegExp(
    `(?:${delimiter}|\\n|^)("(?:(?:"")*[^"]*)*"|[^"${delimiter}\\n]*|(?:\\n|$))`,
  );

  // check if the length of the string is 0 or if the string contains no line returns
  if (csvString.length === 0 || !/\r\b|\r|\n/.test(csvString)) {
    return { data: [] };
  }

  const rows = csvString.split(/\r\n|\r|\n/).filter((elem) => elem !== '');
  const headers = rows[0].split(regex).map((h) => h.trim());
  const requiredHeaders = validators
    .filter((v) => v.required)
    .map((v) => headerTranslations[lang][v.key]);
  const headerErrors = [];
  requiredHeaders.forEach((header) => {
    if (!headers.includes(header)) {
      headerErrors.push({ row: 1, column: header, translation_key: missingColumnsErrorKey });
    }
  });
  if (headerErrors.length > 0) {
    return { data: [], errors: headerErrors };
  }

  const allowedHeaders = validators.map((v) => headerTranslations[lang][v.key]);

  // get all rows except the header and filter out any empty rows
  const dataRows = rows.slice(1).filter((d) => !/^(,? ?\t?)+$/.test(d));

  // Set to keep track of the unique keys - used to make sure only one data entry is uploaded
  // with a particular key defined by getDataKeyFromRow if duplicates are in the file
  const uniqueDataKeys = new Set();

  const headerMapping = getHeaderToValidatorMapping(lang, validators, headerTranslations);

  const { data, errors } = dataRows.reduce(
    (previous, row, rowIndex) => {
      const values = row.split(regex);
      const parsedRow = headers.reduce((previousObj, current, index) => {
        const currentValidator = validators[headerMapping[current]];
        if (allowedHeaders.includes(current)) {
          // remove any surrounding quotation marks
          const val = currentValidator.parse(values[index].replace(/^(["'])(.*)\1$/, '$2'), lang);
          if (currentValidator.validate(val)) {
            previousObj[currentValidator.key] = val;
          } else {
            previous.errors.push({
              row: rowIndex + 2,
              column: current,
              translation_key: currentValidator.errorTranslationKey,
              variables: { [currentValidator.key]: val },
            });
          }
        }
        return previousObj;
      }, {});

      if (validateUniqueDataKeys) {
        const dataKey = getDataKeyFromRow(parsedRow);
        if (!uniqueDataKeys.has(dataKey)) {
          previous.data.push(parsedRow);
          uniqueDataKeys.add(dataKey);
        }
      } else {
        previous.data.push(parsedRow);
      }
      return previous;
    },
    { data: [], errors: [] },
  );

  return { data, errors };
};

export default parseCsv;
