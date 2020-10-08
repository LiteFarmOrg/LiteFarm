/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (crop_data.js) is part of LiteFarm.
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

var csv = require('csvtojson');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return new Promise(resolve => {
    knex('crop').del()
      .then(function () {
        return csv().fromFile(__dirname + '/seedData/crop_data.csv')
          .then((jsonBlob) => {
            const jsonObject = JSON.stringify(jsonBlob, (key, value) => {
              return value.length === 0 ? null : value;
            });
            return knex('crop').insert(JSON.parse(jsonObject)).then(() => {
              resolve();
            })
          });
      });
  })
};
