/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (put_all_datasets.js) is part of LiteFarm.
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

import csv from 'csvtojson';
// eslint-disable-next-line no-unused-vars
import knex from 'knex';
// eslint-disable-next-line no-unused-vars
import farmData from './seedData/generalFarmSeedData.js';
// eslint-disable-next-line no-unused-vars
import _ from 'lodash';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

function insertCsvIntoTable(knex, tableName, fromFile) {
  console.log('inserting', tableName);
  return new Promise((resolve) => {
    knex(tableName)
      .del()
      .then(function () {
        return csv()
          .fromFile(fromFile)
          .then((jsonBlob) => {
            var jsonObject = JSON.stringify(jsonBlob, function (key, value) {
              return value.length === 0 ? null : value;
            });
            return knex(tableName)
              .insert(JSON.parse(jsonObject))
              .then(() => {
                // console.log("resolved", tableName);
                resolve();
              });
          });
      });
  });
}

function insertCropDisease(knex, disease) {
  const { crop_genus, crop_specie, disease_common_name } = disease;
  if (crop_specie.length === 0) {
    return new Promise((resolve) => {
      knex
        .select('crop_id')
        .from('crop')
        .where({
          crop_genus,
        })
        .then((crop_object_ids) => {
          //array of ids of crop
          knex
            .select('disease_id')
            .from('disease')
            .where({ disease_common_name })
            .first()
            .then((disease) => {
              const crop_disease_insertion = crop_object_ids.map((crop_object) => {
                // console.log("crop_id: "+crop_id.crop_id+" diease id:" +disease_id.disease_id)
                if (!!disease && !!disease.disease_id) {
                  //console.log("inserting multiple");
                  return knex('cropDisease').insert({
                    crop_id: crop_object.crop_id,
                    disease_id: disease.disease_id,
                  });
                }
              });
              Promise.all(crop_disease_insertion).then(() => {
                resolve();
              });
            })
            .catch((error) => {
              console.log('Error: ' + error);
            });
        });
    });
  } else {
    return new Promise((resolve) => {
      knex
        .select('crop_id')
        .from('crop')
        .where({
          crop_genus,
          crop_specie,
        })
        .first()
        .then((crop) => {
          // disease.id = id;
          knex
            .select('disease_id')
            .from('disease')
            .where({ disease_common_name })
            .first()
            .then((disease) => {
              if (!!disease && !!crop) {
                //console.log("Inserting one for one");
                knex('cropDisease')
                  .insert({ disease_id: disease.disease_id, crop_id: crop.crop_id })
                  .then(() => {
                    resolve();
                  });
                // console.log("Disease id:"+disease.disease_id+" Crop id:"+crop.crop_id);
              } else {
                resolve();
              }
            });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
}

function insertCropDiseasesData(knex) {
  return knex('cropDisease')
    .del()
    .then(function () {
      return csv().fromFile(__dirname + '/seedData/cropDisease.csv');
    })
    .then(function (diseaseData) {
      const mappingDisease = diseaseData.map((disease) => insertCropDisease(knex, disease));
      console.log('Mapping disease ' + mappingDisease.length);
      return Promise.all(mappingDisease).then(() => {
        console.log('Added all data');
      });
    });
}

// TODO: move this to factories
// eslint-disable-next-line no-unused-vars
function insertTestData(knex, farmData) {
  return new Promise((resolve) => {
    knex(farmData[0].table)
      .insert(farmData[0].data)
      .then(() => {
        knex(farmData[1].table)
          .insert(farmData[1].data)
          .then(() => {
            knex(farmData[2].table)
              .insert(farmData[2].data)
              .then(() => {
                knex(farmData[3].table)
                  .insert(farmData[3].data)
                  .then(() => {
                    knex(farmData[4].table)
                      .insert(farmData[4].data)
                      .then(() => {
                        knex(farmData[5].table)
                          .insert(farmData[5].data)
                          .then(() => {
                            knex(farmData[6].table)
                              .insert(farmData[6].data)
                              .then(async () => {
                                for (let i = 7; i < farmData.length; i++) {
                                  await knex(farmData[i].table).insert(farmData[i].data);
                                }
                              })
                              .then(() => resolve());
                          });
                      });
                  });
              });
          });
      });
  });
}

export const seed = async function (knex) {
  // Deletes ALL existing entries
  var BASEURL = __dirname + '/seedData/';
  const dependencies = [
    'fertilizerLog',
    'fieldCrop',
    'waterBalance',
    'cropDisease',
    'cropCommonName',
    'yield',
    'pestControlLog',
    'shiftTask',
    'pestControlLog',
    'farmExpense',
  ];
  await Promise.all(dependencies.map((dependentTable) => knex(dependentTable).del()));
  console.log('dropped dependencies');
  var seeds = [
    { tableName: 'fertilizer', fileName: BASEURL + 'fertilizers.csv' },
    { tableName: 'crop', fileName: BASEURL + 'crop_data.csv' },
    { tableName: 'disease', fileName: BASEURL + 'disease.csv' },
    { tableName: 'taskType', fileName: BASEURL + 'taskTypes.csv' },
    { tableName: 'pesticide', fileName: BASEURL + 'pesticides.csv' },
    { tableName: 'farmExpenseType', fileName: BASEURL + 'farmExpenseType.csv' },
  ];
  var migration = [];

  seeds.forEach(function (seed) {
    // console.log("Table name:"+seed.tableName + " File name:"+seed.fileName);
    migration.push(insertCsvIntoTable(knex, seed.tableName, seed.fileName));
  });

  return Promise.all(migration)
    .then(() => {
      return insertCropDiseasesData(knex);
    })
    .then(() => {
      console.log('completed crop disease');
    })
    .catch(console.error);
};
