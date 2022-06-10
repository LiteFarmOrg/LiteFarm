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

const SensorController = {
  async bulkUploadSensors(req, res) {
    const { data, errors } = parseCsvString(req.file.buffer.toString(), {
      Test1: 'firstValue',
      test2: 'secondValue',
      test3: 'thirdValue',
    });
    if (errors.length > 0) {
      res.status(400).send({ errors });
    } else {
      console.log(data);
      res.status(200).send('Successfully uploaded!');
    }
  },
};

/**
 * Parses the csv string into an array of objects and an array of any lines that experienced errors.
 * @param {String} csvString
 * @param {Object} headerToKeyMap
 * @param {String} delimiter
 * @returns {Object<data: Array<Object>, errors: Array<Object>>}
 */

const parseCsvString = (csvString, headerToKeyMap, delimiter = ',') => {
  // regex checks for delimiters that are not contained within quotation marks
  const regex = new RegExp(`(?!\\B"[^"]*)${delimiter}(?![^"]*"\\B)`);
  const headers = csvString.substring(0, csvString.indexOf('\n')).split(regex);
  const allowedHeaders = Object.keys(headerToKeyMap);
  const { data, errors } = csvString
    .substring(csvString.indexOf('\n') + 1)
    .split('\n')
    .reduce(
      (previous, row) => {
        const values = row.split(regex);
        const parsedRow = headers.reduce((previous, current, index) => {
          if (allowedHeaders.includes(current)) {
            previous[headerToKeyMap[current]] = values[index];
          }
          return previous;
        }, {});
        previous.data.push(parsedRow);
        return previous;
      },
      { data: [], errors: [] },
    );
  return { data, errors };
};

module.exports = SensorController;
