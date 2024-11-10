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

import parseCsv from "./csv.js";

// Sensor bulk upload error translation keys
export const sensorErrors = {
  FILE_ROW_LIMIT_EXCEEDED:
    "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.FILE_ROW_LIMIT_EXCEEDED",
  MISSING_COLUMNS: "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.MISSING_COLUMNS",
  EXTERNAL_ID: "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.EXTERNAL_ID",
  SENSOR_NAME: "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_NAME",
  SENSOR_LATITUDE: "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_LATITUDE",
  SENSOR_LONGITUDE: "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_LONGITUDE",
  SENSOR_READING_TYPES:
    "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_READING_TYPES",
  SENSOR_DEPTH: "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_DEPTH",
  SENSOR_BRAND: "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_BRAND",
  SENSOR_MODEL: "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_MODEL",
  SENSOR_HARDWARE_VERSION:
    "FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_HARDWARE_VERSION",
  SENSOR_ALREADY_OCCUPIED:
    "FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_CLAIM_ERROR.ALREADY_OCCUPIED",
  SENSOR_DOES_NOT_EXIST:
    "FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_CLAIM_ERROR.DOES_NOT_EXIST",
  INTERNAL_ERROR:
    "FARM_MAP.BULK_UPLOAD_SENSORS.SENSOR_CLAIM_ERROR.INTERNAL_ERROR",
};

const sensorCsvValidators = (translations) => {
  return [
    {
      key: "name",
      parse: (val) => val.trim(),
      validate: (val) => 1 <= val.length && val.length <= 100,
      required: true,
      errorTranslationKey: sensorErrors.SENSOR_NAME,
      useParsedValForError: true,
    },
    {
      key: "external_id",
      parse: (val) => val.trim(),
      validate: (val) => val.length <= 40,
      required: false,
      errorTranslationKey: sensorErrors.EXTERNAL_ID,
      useParsedValForError: true,
    },
    {
      key: "latitude",
      parse: (val) => parseFloat(val),
      validate: (val) => -85 <= val && val <= 85,
      required: true,
      errorTranslationKey: sensorErrors.SENSOR_LATITUDE,
      useParsedValForError: true,
    },
    {
      key: "longitude",
      parse: (val) => parseFloat(val),
      validate: (val) => -180 <= val && val <= 180,
      required: true,
      errorTranslationKey: sensorErrors.SENSOR_LONGITUDE,
      useParsedValForError: true,
    },
    {
      key: "reading_types",
      parse: (val, lang) => {
        const rawReadingTypes = val.replaceAll(" ", "").split(",");
        return getReadableValuesForReadingTypes(
          lang,
          rawReadingTypes,
          translations
        );
      },
      validate: (val) => {
        if (!val.length || (val.length === 1 && val[0] === "")) {
          return false;
        }
        const allowedReadingTypes = [
          "soil_water_potential",
          "soil_water_content",
          "temperature",
        ];
        return val.every((readingType) =>
          allowedReadingTypes.includes(readingType)
        );
      },
      required: true,
      errorTranslationKey: sensorErrors.SENSOR_READING_TYPES,
      useParsedValForError: false,
      additionalVariables: {
        allowed_reading_types: Object.values(
          translations.READING_TYPE_TRANSLATIONS
        ).join(", "),
      },
    },
    {
      key: "depth",
      parse: (val) => parseFloat(val) / 100, // val is in cm, so divide by 100 to get val in m,
      validate: (val) => 0 <= val && val <= 10,
      required: false,
      errorTranslationKey: sensorErrors.SENSOR_DEPTH,
      useParsedValForError: true,
    },
    {
      key: "brand",
      parse: (val) => val.trim(),
      validate: (val) => val.length <= 100,
      required: false,
      errorTranslationKey: sensorErrors.SENSOR_BRAND,
      useParsedValForError: true,
    },
    {
      key: "model",
      parse: (val) => val.trim(),
      validate: (val) => val.length <= 100,
      required: false,
      errorTranslationKey: sensorErrors.SENSOR_MODEL,
      useParsedValForError: true,
    },
  ];
};

// Returns the readable values to save in the database based on the given translated reading types
const getReadableValuesForReadingTypes = (lang, readingTypes, translations) => {
  const translationEntries = Object.entries(
    translations.READING_TYPE_TRANSLATIONS
  );
  return readingTypes.map((rt) => {
    const entryWithReadableValue = translationEntries.find((e) => e[1] === rt);
    return entryWithReadableValue ? entryWithReadableValue[0] : null;
  });
};

const generateSensorKey = (sensor) => {
  if (sensor.brand.length !== 0 && sensor.external_id.length !== 0) {
    return `${sensor.brand}:${sensor.external_id}`;
  } else {
    return sensor.name;
  }
};

export const parseSensorCsv = (csvString, lang, translations) => {
  return parseCsv(
    csvString,
    lang,
    sensorCsvValidators(translations),
    translations.CSV_HEADER_TRANSLATIONS,
    sensorErrors.MISSING_COLUMNS,
    true,
    generateSensorKey,
    100
  );
};

export default parseSensorCsv;
