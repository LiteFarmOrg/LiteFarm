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

// Sensor bulk upload error translation keys
const sensorErrors = {
  FILE_ROW_LIMIT_EXCEEDED: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.FILE_ROW_LIMIT_EXCEEDED',
  MISSING_COLUMNS: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.MISSING_COLUMNS',
  EXTERNAL_ID: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.EXTERNAL_ID',
  SENSOR_NAME: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_NAME',
  SENSOR_LATITUDE: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_LATITUDE',
  SENSOR_LONGITUDE: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_LONGITUDE',
  SENSOR_READING_TYPES: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_READING_TYPES',
  SENSOR_DEPTH: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_DEPTH',
  SENSOR_BRAND: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_BRAND',
  SENSOR_MODEL: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_MODEL',
  SENSOR_HARDWARE_VERSION: 'FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_HARDWARE_VERSION',
  SENSOR_ALREADY_OCCUPIED: 'FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_CLAIM_ERROR.ALREADY_OCCUPIED',
  SENSOR_DOES_NOT_EXIST: 'FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_CLAIM_ERROR.DOES_NOT_EXIST',
  INTERNAL_ERROR: 'FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_CLAIM_ERROR.INTERNAL_ERROR',
};

const sensorCsvValidators = [
  {
    key: 'name',
    parse: (val) => val.trim(),
    validate: (val) => 1 <= val.length && val.length <= 100,
    required: true,
    errorTranslationKey: sensorErrors.SENSOR_NAME,
  },
  {
    key: 'external_id',
    parse: (val) => val.trim(),
    validate: (val) => val.length <= 20,
    required: false,
    errorTranslationKey: sensorErrors.EXTERNAL_ID,
  },
  {
    key: 'latitude',
    parse: (val) => parseFloat(val),
    validate: (val) => -90 <= val && val <= 90,
    required: true,
    errorTranslationKey: sensorErrors.SENSOR_LATITUDE,
  },
  {
    key: 'longitude',
    parse: (val) => parseFloat(val),
    validate: (val) => -180 <= val && val <= 180,
    required: true,
    errorTranslationKey: sensorErrors.SENSOR_LONGITUDE,
  },
  {
    key: 'reading_types',
    parse: (val, lang) => {
      const rawReadingTypes = val.replaceAll(' ', '').split(',');
      return getReadableValuesForReadingTypes(lang, rawReadingTypes);
    },
    validate: (val) => {
      if (!val.length || (val.length === 1 && val[0] === '')) {
        return false;
      }
      const allowedReadingTypes = ['soil_water_potential', 'soil_water_content', 'temperature'];
      return val.every((readingType) => allowedReadingTypes.includes(readingType));
    },
    required: true,
    errorTranslationKey: sensorErrors.SENSOR_READING_TYPES,
  },
  {
    key: 'depth',
    parse: (val) => parseFloat(val),
    validate: (val) => 0 <= val && val <= 1000,
    required: false,
    errorTranslationKey: sensorErrors.SENSOR_DEPTH,
  },
  {
    key: 'brand',
    parse: (val) => val.trim(),
    validate: (val) => val.length <= 100,
    required: false,
    errorTranslationKey: sensorErrors.SENSOR_BRAND,
  },
  {
    key: 'model',
    parse: (val) => val.trim(),
    validate: (val) => val.length <= 100,
    required: false,
    errorTranslationKey: sensorErrors.SENSOR_MODEL,
  },
];

// Returns a mapping in the following format { translated_header: index_of_validator }
const getSensorCsvHeaderMapping = (lang) => {
  const mapping = {};
  sensorCsvValidators.forEach((validator, index) => {
    mapping[sensorCsvTranslations[lang].HEADERS[validator.key]] = index;
  });
  return mapping;
};

// Returns the readable values to save in the database based on the given translated reading types
const getReadableValuesForReadingTypes = (lang, readingTypes) => {
  const translationEntries = Object.entries(sensorCsvTranslations[lang].READING_TYPES);
  return readingTypes.map((rt) => {
    const entryWithReadableValue = translationEntries.find((e) => e[1] === rt);
    return entryWithReadableValue ? entryWithReadableValue[0] : rt;
  });
};

const sensorCsvTranslations = {
  en: {
    HEADERS: {
      name: 'Name',
      latitude: 'Latitude',
      longitude: 'Longitude',
      reading_types: 'Reading_types',
      external_id: 'External_ID',
      depth: 'Depth',
      brand: 'Brand',
      model: 'Model',
    },
    READING_TYPES: {
      soil_water_content: 'soil_water_content',
      soil_water_potential: 'soil_water_potential',
      temperature: 'temperature',
    },
  },
  es: {
    HEADERS: {
      name: 'Nombre',
      latitude: 'Latitud',
      longitude: 'Longitud',
      reading_types: 'tipos_de_medición',
      external_id: 'ID_externo',
      depth: 'Profundidad',
      brand: 'Marca',
      model: 'Modelo',
    },
    READING_TYPES: {
      soil_water_content: 'contenido_de_agua_en_el_suelo',
      soil_water_potential: 'contenido_de_agua_en_el_suelo',
      temperature: 'temperatura',
    },
  },
  fr: {
    HEADERS: {
      name: 'Nom',
      latitude: 'Latitude',
      longitude: 'Longitude',
      reading_types: 'types_à_relevé',
      external_id: 'ID_externe',
      depth: 'Profondeur',
      brand: 'Marque',
      model: 'Modèle',
    },
    READING_TYPES: {
      soil_water_content: 'teneur_en_eau_du_sol',
      soil_water_potential: 'potential_hydrique_du_sol',
      temperature: 'température',
    },
  },
  pt: {
    HEADERS: {
      name: 'Nome',
      latitude: 'Latitude',
      longitude: 'Longitude',
      reading_types: 'tipos_de_medição',
      external_id: 'ID_externo',
      depth: 'Profundidade',
      brand: 'Marca',
      model: 'Modelo',
    },
    READING_TYPES: {
      soil_water_content: 'teor_de_água_no_solo',
      soil_water_potential: 'potencial_de_água_do_solo',
      temperature: 'temperatura',
    },
  },
};

/**
 * Parses the csv string into an array of objects and an array of any lines that experienced errors.
 * @param {String} csvString
 * @param {Object} mapping - a mapping from csv column headers to object keys, as well as the validators for the data in the columns
 * @param {String} delimiter
 * @returns {Object<data: Array<Object>, errors: Array<Object>>}
 */

const parseSensorCsv = (csvString, userLang, delimiter = ',') => {
  // regex checks for delimiters that are not contained within quotation marks
  const regex = new RegExp(
    `(?:${delimiter}|\\n|^)("(?:(?:"")*[^"]*)*"|[^"${delimiter}\\n]*|(?:\\n|$))`,
  );
  if (csvString.length === 0 || !/\r\b|\r|\n/.test(csvString)) {
    return { data: [] };
  }
  const rows = csvString.split(/\r\n|\r|\n/).filter((elem) => elem !== '');
  const headers = rows[0].split(regex).map((h) => h.trim());
  const requiredHeaders = sensorCsvValidators
    .filter((v) => v.required)
    .map((v) => sensorCsvTranslations[userLang].HEADERS[v.key]);
  const headerErrors = [];
  requiredHeaders.forEach((header) => {
    if (!headers.includes(header)) {
      headerErrors.push({ row: 1, column: header, translation_key: sensorErrors.MISSING_COLUMNS });
    }
  });
  if (headerErrors.length > 0) {
    return { data: [], errors: headerErrors };
  }
  const allowedHeaders = sensorCsvValidators.map(
    (v) => sensorCsvTranslations[userLang].HEADERS[v.key],
  );
  const dataRows = rows.slice(1);

  const headerMapping = getSensorCsvHeaderMapping(userLang);

  const { data, errors } = dataRows.reduce(
    (previous, row, rowIndex) => {
      const values = row.split(regex);
      const parsedRow = headers.reduce((previousObj, current, index) => {
        const currentValidator = sensorCsvValidators[headerMapping[current]];
        if (allowedHeaders.includes(current)) {
          // remove any surrounding quotation marks
          const val = currentValidator.parse(
            values[index].replace(/^(["'])(.*)\1$/, '$2'),
            userLang,
          );
          if (currentValidator.validate(val)) {
            previousObj[currentValidator.key] = val;
          } else {
            previous.errors.push({
              row: rowIndex + 2,
              column: current,
              translation_key: currentValidator.errorTranslationKey,
            });
          }
        }
        return previousObj;
      }, {});
      previous.data.push(parsedRow);
      return previous;
    },
    { data: [], errors: [] },
  );

  return { data, errors };
};

module.exports = {
  sensorErrors,
  parseSensorCsv,
};
