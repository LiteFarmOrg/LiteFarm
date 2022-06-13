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

const baseController = require('../controllers/baseController');
const sensorModel = require('../models/sensorModel');
const { transaction, Model } = require('objection');

const sensorController = {
  async addSensors(req, res) {
    const { data, errors } = parseCsvString(req.file.buffer.toString(), {
      Name: {
        key: 'name',
        parseFunction: (val) => val.trim(),
        validator: (val) => 1 <= val.length && val.length <= 100,
        required: true,
      },
      External_ID: {
        key: 'external_id',
        parseFunction: (val) => val.trim(),
        validator: (val) => 1 <= val.length && val.length <= 20,
        required: false,
      },
      Latitude: {
        key: 'latitude',
        parseFunction: (val) => parseFloat(val),
        validator: (val) => -90 <= val && val <= 90,
        required: true,
      },
      Longitude: {
        key: 'longitude',
        parseFunction: (val) => parseFloat(val),
        validator: (val) => -180 <= val && val <= 180,
        required: true,
      },
      Reading_types: {
        key: 'reading_types',
        parseFunction: (val) => val.replaceAll(' ', '').split(','),
        validator: (val) =>
          val.includes('soil_moisture_content') ||
          val.includes('water_potential') ||
          val.includes('temperature'),
        required: true,
      },
      Depth: {
        key: 'depth',
        parseFunction: (val) => parseFloat(val),
        validator: (val) => 0 <= val && val <= 1000,
        required: false,
      },
      Brand: {
        key: 'brand',
        parseFunction: (val) => val.trim(),
        validator: (val) => val.length <= 100,
        required: false,
      },
      Model: {
        key: 'model',
        parseFunction: (val) => val.trim(),
        validator: (val) => val.length <= 100,
        required: false,
      },
      Hardware_version: {
        key: 'hardware_version',
        parseFunction: (val) => val.trim(),
        validator: (val) => val.length <= 100,
        required: false,
      },
    });
    if (errors.length > 0) {
      res.status(400).send({ errors });
    } else {
      console.log(data);
      res.status(200).send('Successfully uploaded!');
    }
  },

  deleteSensor() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(sensorModel, '2', req, { trx });
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  editSensor() {
    return async (req, res) => {
      try {
        res.status(200).send('OK');
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  getSensorsByFarmId() {
    return async (req, res) => {
      try {
        // TODO: Add this back
        // const { farm_id } = req.body.farm_id;
        // if (!farm_id){
        //     return res.status(400).send('No country selected');
        // }
        const data = await baseController.getByFieldId(sensorModel, 'farm_id', 'Testing');
        res.status(200).send(data);
      } catch (error) {
        //handle exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  addReading() {
    return async (req, res) => {
      try {
        res.status(200).send('OK');
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  getAllReadingsBySensorId() {
    return async (req, res) => {
      try {
        res.status(200).send('OK');
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },
};

/**
 * Parses the csv string into an array of objects and an array of any lines that experienced errors.
 * @param {String} csvString
 * @param {Object} mapping - a mapping from csv column headers to object keys, as well as the validators for the data in the columns
 * @param {String} delimiter
 * @returns {Object<data: Array<Object>, errors: Array<Object>>}
 */

const parseCsvString = (csvString, mapping, delimiter = ',') => {
  // regex checks for delimiters that are not contained within quotation marks
  const regex = new RegExp(`(?!\\B"[^"]*)${delimiter}(?![^"]*"\\B)`);
  const headers = csvString.substring(0, csvString.indexOf('\n')).split(regex);
  const allowedHeaders = Object.keys(mapping);
  const { data, errors } = csvString
    .substring(csvString.indexOf('\n') + 1)
    .split('\n')
    .reduce(
      (previous, row, rowIndex) => {
        const values = row.split(regex);
        const parsedRow = headers.reduce((previousObj, current, index) => {
          if (allowedHeaders.includes(current)) {
            const val = mapping[current].parseFunction(
              values[index].replace(/^(["'])(.*)\1$/, '$2'),
            ); // removes any surrounding quotation marks
            if (mapping[current].validator(val)) {
              previousObj[mapping[current].key] = val;
            } else {
              previous.errors.push({ line: rowIndex + 2, errorColumn: current }); //TODO: add better error messages
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

module.exports = sensorController;
