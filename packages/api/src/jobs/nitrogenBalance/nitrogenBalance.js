/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (nitrogenBalance.js) is part of LiteFarm.
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

const scheduler = require('node-schedule');
const nitrogenBalanceModel = require('../../models/nitrogenBalanceModel');
const { transaction, Model } = require('objection');
const knex = Model.knex();
/* eslint-disable no-console*/

class NitrogenBalance {
  static registerDailyJob() {
    const rule = new scheduler.RecurrenceRule();
    rule.hour = 23;
    rule.minute = 30;
    // I make this 11:30pm as waterBalance has one for 11:00pm
    scheduler.scheduleJob(rule, () => {
      const currDate = formatDate(new Date());
      grabFarmIDsToRun(currDate)
        .then((currFarms) => {
          if (Array.isArray(currFarms) && currFarms.length > 0) {
            currFarms.forEach(async (farm) => {
              runNitrogenBalance(farm)
                .then((nitrogenBalanceByField) => { // saved as hashmap by field ID
                  saveToDB(nitrogenBalanceByField);
                })
                .then(() => {
                  console.log('Nitrogen Balance Model successfully finished on Farm: ' + farm)
                }).catch((error) => {
                  console.log(error)
                })
            })
          }
        });
      console.log('Nitrogen Balance Daily Calculation is Done')
    })
  }

  static runOnce() {
    const currDate = formatDate(new Date());
    grabFarmIDsToRun(currDate)
      .then((currFarms) => {
        if (Array.isArray(currFarms) && currFarms.length > 0) {
          currFarms.forEach(async (farm) => {
            runNitrogenBalance(farm)
              .then((nitrogenBalanceByField) => { // saved as hashmap by field ID
                saveToDB(nitrogenBalanceByField);
              })
              .then(() => {
                console.log('Nitrogen Balance Model successfully finished on Farm: ' + farm)
              }).catch((error) => {
                console.log(error)
              })
          })
        }
      });
  }
}

const grabFarmIDsToRun = async (currDate) => {
  const dataPoints = await knex.raw(`SELECT n.farm_id
  FROM "nitrogenSchedule" n
  WHERE to_char(date(n.scheduled_at), 'YYYY-MM-DD') = ?`, [currDate]);
  return dataPoints.rows
};

const runNitrogenBalance = async (farmIDJSON) => {
  const farmID = farmIDJSON['farm_id'];
  const [inputN, outputN] = await Promise.all([inputNitrogenForFarm(farmID), outputNitrogenForFarm(farmID)]);
  return await finalNitrogenValuesByField(inputN, outputN)
};

const inputNitrogenForFarm = async (farmID) => {
  const dataPoints = await knex.raw(`
  SELECT f.fertilizer_id, fl.quantity_kg, f.fertilizer_type, f.moisture_percentage, f.n_percentage, f.nh4_n_ppm, f.p_percentage, f.k_percentage, f.mineralization_rate, af.field_id, SUM(c.nutrient_credits * (fc.area_used/10000)) as field_nutrient_credits
  FROM "fertilizerLog" fl, "fertilizer" f, "activityLog" a, "users" u, "nitrogenSchedule" n, "activityFields" af, "fieldCrop" fc, "crop" c
  WHERE fl.activity_id = a.activity_id and u.farm_id = ? and u.user_id = a.user_id and f.fertilizer_id = fl.fertilizer_id and n.farm_id = ? and date(n.created_at) < date(a.date) and date(n.scheduled_at) >= date(a.date) and af.activity_id = a.activity_id and fc.field_id = af.field_id and c.crop_id = fc.crop_id
  GROUP BY f.fertilizer_id, fl.quantity_kg, f.fertilizer_type, f.moisture_percentage, f.n_percentage, f.nh4_n_ppm, f.p_percentage, f.k_percentage, f.mineralization_rate, af.field_id
`, [farmID, farmID]);
  /* these data points were found here:
  https://pdfs.semanticscholar.org/f300/3faece1e5ed8b3525ad6114d7d654f156076.pdf
  in table 1
  */
  const totalNitrogenInputByField = {};
  //const cropCredits = 0; //@TODO how to get crop credits?
  if(dataPoints.rows) {
    await Promise.all(dataPoints.rows.map(async (data) => {
      const currentTotalNitrogen = (data['quantity_kg'] * (data['n_percentage']/100));
      const currentNH3 = 0; //@TODO still need this from the crop nutrient that Zia will update
      const currentNH4 = (data['nh4_n_ppm'] / 1000000) * data['quantity_kg'];
      const nitrogenCredits = data['field_nutrient_credits'];
      const mineralizationRate = data['mineralization_rate'];
      const totalNitrogenForFert =  nitrogenCredits + ((currentTotalNitrogen - currentNH3 - currentNH4) * mineralizationRate) + currentNH4 + currentNH3;

      if (data['field_id'] in totalNitrogenInputByField) {
        totalNitrogenInputByField[data['field_id']] += totalNitrogenForFert;
      } else {
        totalNitrogenInputByField[data['field_id']] = totalNitrogenForFert;
      }
    }))
  }
  return totalNitrogenInputByField
};


const outputNitrogenForFarm = async (farmID) => {
  const dataPoints = await knex.raw(`
  SELECT h.quantity_kg, c.crop_id, c.crop_common_name, c.percentrefuse, c.protein, fc.field_id
  FROM "harvestLog" h, "activityLog" a, "users" u, "activityCrops" ac, "nitrogenSchedule" n, "crop" c, "fieldCrop" fc
  WHERE h.activity_id = a.activity_id and u.farm_id = ? and ac.activity_id = h.activity_id and date(n.created_at) < date(a.date) and date(n.scheduled_at) >= date(a.date) and fc.field_crop_id = ac.field_crop_id and c.crop_id = fc.crop_id
  `, [farmID]);
  const totalNitrogenOutputByField = {};
  if(dataPoints.rows) {
    await Promise.all(dataPoints.rows.map(async (data) => {
      const quantityHarvested = data['quantity_kg'];
      const refuse = data['percentrefuse'] / 100 || 0;
      const proteinContent = Math.round(data['protein'] * 1000 / 1000) / 100;
      const factorToConvertFromProteinToNitrogen = 0.16;
      const moistureFactor = 1; // Defaulted to 1 see below comment
      // Also there should be an X which is the factor to adjust moisture difference, Zia said to just note it here and not put it in the calculation
      console.log(quantityHarvested, refuse, proteinContent, factorToConvertFromProteinToNitrogen, moistureFactor)
      const totalNitrogenInCrop = quantityHarvested * (1 - refuse) * proteinContent * factorToConvertFromProteinToNitrogen * moistureFactor;
      if (data['field_id'] in totalNitrogenOutputByField) {
        totalNitrogenOutputByField[data['field_id']] += totalNitrogenInCrop
      } else {
        totalNitrogenOutputByField[data['field_id']] = totalNitrogenInCrop
      }
    }))
  }
  return totalNitrogenOutputByField
};

const finalNitrogenValuesByField = (inputN, outputN) => {
  for (const key in outputN) {
    if (key in inputN) {
      inputN[key] = inputN[key] - outputN[key];
    } else {
      inputN[key] = -outputN[key]
    }
    inputN[key] = Math.round(inputN[key] * 100) / 100;
  }
  return inputN
};

const saveToDB = async (nitrogenBalanceByField) => {
  const trx = await transaction.start(Model.knex());
  try {
    for (const key in nitrogenBalanceByField) {
      await nitrogenBalanceModel.query(trx).insert({ field_id: key, nitrogen_value: nitrogenBalanceByField[key] }).returning('*');
    }
    await trx.commit();
  } catch (e) {
    await trx.rollback();
    console.log(e);
  }
};


const formatDate = (date) => {
  const d = new Date(date), year = d.getFullYear();
  let
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

module.exports = NitrogenBalance;
