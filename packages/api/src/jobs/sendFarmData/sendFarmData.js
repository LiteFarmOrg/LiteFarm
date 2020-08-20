/* eslint-disable */
/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (sendFarmData.js) is part of LiteFarm.
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

const fs = require('async-file');
const fieldModel = require('../../models/fieldModel');
const FieldCropController = require('../../controllers/fieldCropController');
const logController = require('../../controllers/logController');
const logServices = logController.logServices;
const farmExpenseModel = require('../../models/farmExpenseModel');
const SaleController = require('../../controllers/saleController');
const farmModel = require('../../models/farmModel');
const fertilizerModel = require('../../models/fertilizerModel');
const pesticideModel = require('../../models/pesiticideModel');
const harvModel = require('../../models/harvestLogModel');
const seedModel = require('../../models/seedLogModel');
const fieldWorkModel = require('../../models/fieldWorkLogModel');
const soilDataModel = require('../../models/soilDataLogModel');
const irriModel = require('../../models/irrigationLogModel');
const scoutModel = require('../../models/scoutingLogModel');
const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../../knexfile')[environment];
const knex = Knex(config);
const credentials = require('../../credentials');
const scheduler = require('node-schedule');
const baseController = require('../../controllers/baseController');
const nodemailer = require('nodemailer');
const converter = require('json-2-csv');
const fse = require('fs-extra');
const fs_regular = require('fs');
const AdmZip = require('adm-zip');

const TEMPLATE = {
  'farm': [],
  'users': [],
  'fields': [],
  'field_crops': [],
  'shifts': [],
  'logs': [],
  'expenses': [],
  'sales': [],
};

class sendUserFarmDataScheduler {
  static registerJob() {
    const rule = new scheduler.RecurrenceRule();
    if (process.env.REACT_APP_ENV === 'production') {
      rule.minute = new scheduler.Range(0, 59, 30);
    } else {
      rule.second = new scheduler.Range(0, 59, 15);
    }


    scheduler.scheduleJob(rule, () => {
      let request_id;
      grabFarmIDsToRun()
        .then(async (currFarms) => {
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              clientId: credentials.LiteFarm_Service_Gmail.client_id,
              clientSecret: credentials.LiteFarm_Service_Gmail.client_secret,
            },
          });

          let obj; // a farm
          if (currFarms.length > 0) {
            obj = currFarms[0];
          }
          else {
            return;
          }
          if (!fs_regular.existsSync(__dirname + '/temp_files')) {
            fs_regular.mkdirSync(__dirname + '/temp_files');
          }
          await cleanFiles();
          const farm_id = obj.farm_id;
          const request_number = obj.request_number;
          request_id = request_number;
          const user_id = obj.user_id;
          const user_email = await getUserEmail(user_id);
          const template = TEMPLATE;

          template.farm = await baseController.getIndividual(farmModel, farm_id);
          const user_data = await knex.raw(
            `
          SELECT uf.user_id, uf.farm_id, uf.role_id, uf.has_consent, u.created_at, u.first_name, u.last_name, u.profile_picture, u.email, u.phone_number,
          uf.wage, u.is_pseudo, uf.status
          FROM "userFarm" uf
          LEFT JOIN
          "users" u
          ON uf.user_id = u.user_id
          WHERE uf.farm_id = '${farm_id}'
          `
          );
          template.users = user_data.rows;
          template.fields = await baseController.getByForeignKey(fieldModel, 'farm_id', farm_id);
          template.field_crops = await FieldCropController.getByForeignKey(farm_id);

          const get_shifts = await knex.raw(
            `
          SELECT t.shift_id, t.task_id, tp.task_name, t.duration AS "duration_minute", s.break_duration AS "break_duration_minute", s.start_time, s.end_time, s.wage_at_moment AS "hourly_wage", u.user_id, u.first_name, u.last_name, x.crop_id, x.crop_common_name, t.is_field, t.field_id, t.field_crop_id
          FROM "shiftTask" t
          LEFT JOIN (
	          SELECT f.field_crop_id, c.crop_id, crop_common_name
	          FROM "fieldCrop" f, "crop" c
	          WHERE f.crop_id = c.crop_id
	          )
	          x ON x.field_crop_id = t.field_crop_id,
          "shift" s, "users" u, "taskType" tp, "userFarm" uf
          WHERE s.shift_id = t.shift_id AND s.user_id = u.user_id  AND uf.user_id = u.user_id AND uf.farm_id = '${farm_id}'
          AND t.task_id = tp.task_id
          `
          );
          template.shifts = get_shifts.rows;

          template.expenses = await baseController.getByForeignKey(farmExpenseModel, 'farm_id', farm_id);

          template.sales = await SaleController.getSalesOfFarm(farm_id);
          for (const sale of template.sales) {
            // load related prices and yields of this sale
            await sale.$loadRelated('cropSale.crop.[price(getFarm), yield(getFarm)]', {
              getFarm: (builder) => {
                builder.where('farm_id', farm_id);
              },
            });
          }

          await processLogs(farm_id);


          await saveJson(template.farm, 'farm');
          delete(template.users.notification_setting);
          await saveJson(template.users, 'users');
          await saveJson(template.fields, 'fields');
          delete(template.field_crops.crop);
          await saveJson(template.field_crops, 'field_crops', ['farm_id', 'field_id', 'field_name', 'grid_points.lat', 'grid_points.lng', 'crop_id', 'field_crop_id', 'crop_common_name', 'crop_genus', 'crop_specie', 'crop_group', 'crop_subgroup', 'start_date',
            'end_date', 'area_used', 'estimated_production', 'estimated_revenue', 'is_by_bed', 'bed_config', 'field_name', 'deleted', 'yield.quantity_kg/m2', 'price.value_$/kg'
          ]);

          await saveJson(template.shifts, 'shifts', null);
          await processSale(template.sales);
          await saveJson(template.expenses, 'expenses', ['farm_id', 'expense_date', 'picture', 'expense_type_id', 'expense_type', 'note', 'farm_expense_id', 'value']);

          let zip = new AdmZip();

          zip.addLocalFile(__dirname + '/temp_files/farm.csv');
          zip.addLocalFile(__dirname + '/temp_files/users.csv');
          zip.addLocalFile(__dirname + '/temp_files/expenses.csv');
          zip.addLocalFile(__dirname + '/temp_files/fertilizing_logs.csv');
          zip.addLocalFile(__dirname + '/temp_files/field_crops.csv');
          zip.addLocalFile(__dirname + '/temp_files/field_work_logs.csv');
          zip.addLocalFile(__dirname + '/temp_files/fields.csv');
          zip.addLocalFile(__dirname + '/temp_files/harvest_logs.csv');
          zip.addLocalFile(__dirname + '/temp_files/irrigation_logs.csv');
          zip.addLocalFile(__dirname + '/temp_files/other_logs.csv');
          zip.addLocalFile(__dirname + '/temp_files/pesticide_logs.csv');
          zip.addLocalFile(__dirname + '/temp_files/sales.csv');
          zip.addLocalFile(__dirname + '/temp_files/scouting_logs.csv');
          zip.addLocalFile(__dirname + '/temp_files/seed_logs.csv');
          zip.addLocalFile(__dirname + '/temp_files/shifts.csv');
          zip.addLocalFile(__dirname + '/temp_files/soil_data_logs.csv');
          zip.writeZip(__dirname + `/temp_files/${farm_id}_data.zip`);

          try {
            await transporter.sendMail({
              from: 'LiteFarm <system@litefarm.org>',
              to: user_email, // list of receivers
              subject: 'Farm Data Request', // Subject line
              text: 'Please find your data in the attachment', // plain text body
              attachments: [
                //     // {   // filename and content type is derived from path
                //     //   path: __dirname + '/temp_files/farm.csv',
                //     // },
                //     // {
                //     //   path: __dirname + '/temp_files/users.csv',
                //     // },
                //     // {
                //     //   path: __dirname + '/temp_files/fields.csv',
                //     // },
                //     // {
                //     //   path: __dirname + '/temp_files/field_crops.csv',
                //     // },
                //     // {
                //     //   path: __dirname + '/temp_files/shifts.csv',
                //     // },
                //     // {
                //     //   path: __dirname + '/temp_files/logs.csv',
                //     // },
                {
                  path: __dirname + `/temp_files/${farm_id}_data.zip`,
                },
                //     // {
                //     //   path: __dirname + '/temp_files/sales.csv',
                //     // },
              ],
              auth: {
                user: 'system@litefarm.org',
                refreshToken: credentials.LiteFarm_Service_Gmail.refresh_token,
              },
            });

            console.log(`FarmDataScheduler: file sent for farm_id: ${farm_id}`);

            await cleanFiles();

            try {
              await knex('farmDataSchedule')
                .where({request_number})
                .update({is_processed: true}, ['request_number', 'is_processed'])
            }
            catch (error) {
              await setHasFailed(request_number);
              console.log('FarmDataScheduler: failed to update process status', error);
            }
          }
          catch (error) {
            await setHasFailed(request_number);
            console.log('FarmDataScheduler: failed to send file\n', error);
          }
        })
        .catch(async (error) => {
          console.log(error);
        });
    });
  }
}

const setHasFailed = async (request_number) => {
  try {
    await knex('farmDataSchedule')
      .where({request_number})
      .update({has_failed: true}, ['request_number', 'has_failed'])
  }
  catch (error) {
    console.log('FarmDataScheduler: failed to update failed status', error);
  }
};


const SALE = {
  sale_id: null,
  customer_name: null,
  sale_date: null,
  sale_quantity_kg: null,
  sale_value: null,
  field_crop_id: null,
  crop_id: null,
  crop_common_name: null,
};

const FERT = {
  activity_id: null,
  activity_kind: null,
  first_name: null,
  last_name: null,
  user_id: null,
  date: null,
  photo: null,
  field_id: null,
  field_name: null,
  field_area_m2: null,
  field_crop_id: null,
  crop_common_name: null,
  notes: null,
  fertilizer_id: null,
  fertilizer_type: null,
  fertilizer_quantity_kg: null,
  fert_moisture_percentage: null,
  fert_n_percentage: null,
  fert_nh4_n_ppm: null,
  fert_p_percentage: null,
  fert_k_percentage: null,
  fert_mineralization_rate: null,
};

const PEST = {
  activity_id: null,
  activity_kind: null,
  first_name: null,
  last_name: null,
  user_id: null,
  date: null,
  photo: null,
  field_id: null,
  field_name: null,
  field_area_m2: null,
  field_crop_id: null,
  crop_common_name: null,
  notes: null,

  pesticide_id: null,
  pesticide_name: null,
  pest_entry_interval: null,
  pest_harvest_interval: null,
  pest_active_ingredients: null,
  pest_concentration: null,
};

const HARV = {
  activity_id: null,
  activity_kind: null,
  first_name: null,
  last_name: null,
  user_id: null,
  date: null,
  photo: null,
  field_id: null,
  field_name: null,
  field_area_m2: null,
  field_crop_id: null,
  crop_common_name: null,
  notes: null,

  harvest_quantity_kg: null,
};

const SEED = {
  activity_id: null,
  activity_kind: null,
  first_name: null,
  last_name: null,
  user_id: null,
  date: null,
  photo: null,
  field_id: null,
  field_name: null,
  field_area_m2: null,
  field_crop_id: null,
  crop_common_name: null,
  notes: null,

  seed_type: null,
  seed_space_depth_cm: null,
  seed_space_length_cm: null,
  seed_space_width_cm: null,
  seed_rate_seeds_per_m2: null,
};

const FIEL = {
  activity_id: null,
  activity_kind: null,
  first_name: null,
  last_name: null,
  user_id: null,
  date: null,
  photo: null,
  field_id: null,
  field_name: null,
  field_area_m2: null,
  field_crop_id: null,
  crop_common_name: null,
  notes: null,

  field_work_type: null,
};

const SOIL = {
  activity_id: null,
  activity_kind: null,
  first_name: null,
  last_name: null,
  user_id: null,
  date: null,
  photo: null,
  field_id: null,
  field_name: null,
  field_area_m2: null,
  notes: null,

  soil_texture: null,
  soil_k: null,
  soil_p: null,
  soil_n: null,
  soil_om: null,
  soil_ph: null,
  soil_bulk_density_kg_per_m3: null,
  soil_organic_carbon: null,
  soil_inorganic_carbon: null,
  soil_s: null,
  soil_ca: null,
  soil_mg: null,
  soil_zn: null,
  soil_mn: null,
  soil_fe: null,
  soil_cu: null,
  soil_b: null,
  soil_c: null,
  soil_cec: null,
  soil_na: null,
  soil_total_carbon: null,
  soil_depth_cm: null,
};

const IRRI = {
  activity_id: null,
  activity_kind: null,
  first_name: null,
  last_name: null,
  user_id: null,
  date: null,
  photo: null,
  field_id: null,
  field_name: null,
  field_area_m2: null,
  field_crop_id: null,
  crop_common_name: null,
  notes: null,

  irrigation_type: null,
  irri_flow_rate: null,
  irri_flow_rate_unit: null,
  irri_hours: null,
};

const SCOUT = {
  activity_id: null,
  activity_kind: null,
  first_name: null,
  last_name: null,
  user_id: null,
  date: null,
  photo: null,
  field_id: null,
  field_name: null,
  field_area_m2: null,
  field_crop_id: null,
  crop_common_name: null,
  notes: null,

  scout_type: null,
};

const OTHER = {
  activity_id: null,
  activity_kind: null,
  first_name: null,
  last_name: null,
  user_id: null,
  date: null,
  photo: null,
  field_id: null,
  field_name: null,
  field_area_m2: null,
  field_crop_id: null,
  crop_common_name: null,
  notes: null,
};

const processSale = async (sales) => {
  let processed = [];
  for (let sale of sales) {
    for (let s of sale.cropSale) {
      let obj = Object.assign({}, SALE);
      obj.sale_id = sale.sale_id;
      obj.customer_name = sale.customer_name;
      obj.sale_date = sale.sale_date;
      obj.sale_quantity_kg = s.quantity_kg;
      obj.sale_value = s.sale_value;
      obj.crop_id = s.crop_id;
      obj.crop_common_name = s.crop.crop_common_name;
      processed.push(obj);
    }
  }
  await saveJson(processed, 'sales', Object.keys(SALE));
};

const getFieldNameNArea = (field_id, fields) => {
  // name_area[0]: Name, [1]: Area
  let name_area = [];
  for (let f of fields) {
    if (f.field_id === field_id) {
      name_area.push(f.field_name);
      name_area.push(f.area);
      break;
    }
  }
  return name_area;
};

const processFert = async (log) => {
  let field_length = log['field'].length;
  let crop_length = log['fieldCrop'].length;

  let processed = [];

  let fertilizer_id = log.fertilizerLog.fertilizer_id;
  let fertDetail = await baseController.getIndividual(fertilizerModel, fertilizer_id);

  if (crop_length === 0) {
    // Here: no crop, user selected fields only
    for (let i = 0; i < field_length; i++) {
      let logObj = Object.assign({}, FERT);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.field[i].field_id;
      logObj.field_name = log.field[i].field_name;
      logObj.field_area_m2 = log.field[i].area;
      logObj.notes = log.notes;
      logObj.fertilizer_id = fertilizer_id;
      logObj.fertilizer_quantity_kg = log.fertilizerLog.quantity_kg;
      logObj.fertilizer_type = fertDetail[0].fertilizer_type;
      logObj.fert_moisture_percentage = fertDetail[0].moisture_percentage;
      logObj.fert_n_percentage = fertDetail[0].n_percentage;
      logObj.fert_nh4_n_ppm = fertDetail[0].nh4_n_ppm;
      logObj.fert_p_percentage = fertDetail[0].p_percentage;
      logObj.fert_k_percentage = fertDetail[0].k_percentage;
      logObj.fert_mineralization_rate = fertDetail[0].mineralization_rate;

      processed.push(logObj);
    }

  } else if (crop_length > 0) {
    // has crop so we ignore fields

    for (let i = 0; i < crop_length; i++) {
      let logObj = Object.assign({}, FERT);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.fieldCrop[i].field_id;

      let nameArea = getFieldNameNArea(log.fieldCrop[i].field_id, log.field);
      logObj.field_name = nameArea[0];
      logObj.field_area_m2 = nameArea[1];

      logObj.notes = log.notes;

      logObj.field_crop_id = log.fieldCrop[i].field_crop_id;
      logObj.crop_common_name = log.fieldCrop[i].crop.crop_common_name;

      logObj.fertilizer_id = fertilizer_id;
      logObj.fertilizer_quantity_kg = log.fertilizerLog.quantity_kg;
      logObj.fertilizer_type = fertDetail[0].fertilizer_type;
      logObj.fert_moisture_percentage = fertDetail[0].moisture_percentage;
      logObj.fert_n_percentage = fertDetail[0].n_percentage;
      logObj.fert_nh4_n_ppm = fertDetail[0].nh4_n_ppm;
      logObj.fert_p_percentage = fertDetail[0].p_percentage;
      logObj.fert_k_percentage = fertDetail[0].k_percentage;
      logObj.fert_mineralization_rate = fertDetail[0].mineralization_rate;

      processed.push(logObj);
    }
  }

  return processed;

};

const processPest = async (log) => {
  let field_length = log['field'].length;
  let crop_length = log['fieldCrop'].length;

  let pesticide_id = log.pestControlLog.pesticide_id;
  let pesticideDetail = await baseController.getIndividual(pesticideModel, pesticide_id);

  let processed = [];

  if (crop_length === 0) {
    // Here: no crop, user selected fields only
    for (let i = 0; i < field_length; i++) {
      let logObj = Object.assign({}, PEST);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.field[i].field_id;
      logObj.field_name = log.field[i].field_name;
      logObj.field_area_m2 = log.field[i].area;
      logObj.notes = log.notes;
      logObj.pesticide_id = pesticide_id;
      logObj.pesticide_name = pesticideDetail[0].pesticide_name;
      logObj.pest_entry_interval = pesticideDetail[0].entry_interval;
      logObj.pest_harvest_interval = pesticideDetail[0].harvest_interval;
      logObj.pest_active_ingredients = pesticideDetail[0].active_ingredients;
      logObj.pest_concentration = pesticideDetail[0].concentration;
      processed.push(logObj);
    }

  } else if (crop_length > 0) {
    // has crop so we ignore fields

    for (let i = 0; i < crop_length; i++) {
      let logObj = Object.assign({}, PEST);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.fieldCrop[i].field_id;

      let nameArea = getFieldNameNArea(log.fieldCrop[i].field_id, log.field);
      logObj.field_name = nameArea[0];
      logObj.field_area_m2 = nameArea[1];

      logObj.notes = log.notes;

      logObj.field_crop_id = log.fieldCrop[i].field_crop_id;
      logObj.crop_common_name = log.fieldCrop[i].crop.crop_common_name;

      logObj.pesticide_id = pesticide_id;
      logObj.pesticide_name = pesticideDetail[0].pesticide_name;
      logObj.pest_entry_interval = pesticideDetail[0].entry_interval;
      logObj.pest_harvest_interval = pesticideDetail[0].harvest_interval;
      logObj.pest_active_ingredients = pesticideDetail[0].active_ingredients;
      logObj.pest_concentration = pesticideDetail[0].concentration;
      processed.push(logObj);
    }
  }

  return processed;

};

const processHarv = async (log) => {
  let crop_length = log['fieldCrop'].length;

  let activity_id = log.activity_id;
  let harvDetail = await baseController.getIndividual(harvModel, activity_id);

  let processed = [];

  if (crop_length > 0) {
    // has a single crop per log

    for (let i = 0; i < crop_length; i++) {
      let logObj = Object.assign({}, HARV);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.fieldCrop[i].field_id;

      let nameArea = getFieldNameNArea(log.fieldCrop[i].field_id, log.field);
      logObj.field_name = nameArea[0];
      logObj.field_area_m2 = nameArea[1];

      logObj.notes = log.notes;

      logObj.field_crop_id = log.fieldCrop[i].field_crop_id;
      logObj.crop_common_name = log.fieldCrop[i].crop.crop_common_name;

      logObj.harvest_quantity_kg = harvDetail[0].quantity_kg;
      processed.push(logObj);
    }
  }

  return processed;
};

const processSeed = async (log) => {
  let crop_length = log['fieldCrop'].length;

  let activity_id = log.activity_id;
  let seedDetail = await baseController.getIndividual(seedModel, activity_id);

  let processed = [];

  if (crop_length > 0) {
    // has to have more than 0 crops

    for (let i = 0; i < crop_length; i++) {
      let logObj = Object.assign({}, SEED);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.fieldCrop[i].field_id;

      let nameArea = getFieldNameNArea(log.fieldCrop[i].field_id, log.field);
      logObj.field_name = nameArea[0];
      logObj.field_area_m2 = nameArea[1];

      logObj.notes = log.notes;

      logObj.field_crop_id = log.fieldCrop[i].field_crop_id;
      logObj.crop_common_name = log.fieldCrop[i].crop.crop_common_name;

      logObj.seed_type = seedDetail[0].type;
      logObj.seed_space_depth_cm = seedDetail[0].space_depth_cm;
      logObj.seed_space_length_cm = seedDetail[0].space_length_cm;
      logObj.seed_space_width_cm = seedDetail[0].space_width_cm;
      logObj.seed_rate_seeds_per_m2 = seedDetail[0]["rate_seeds/m2"];
      processed.push(logObj);
    }
  }

  return processed;
};

const processFieldWork = async (log) => {
  let field_length = log['field'].length;
  let crop_length = log['fieldCrop'].length;

  let activity_id = log.activity_id;
  let fieldWorkDetail = await baseController.getIndividual(fieldWorkModel, activity_id);

  let processed = [];

  if (crop_length === 0) {
    // Here: no crop, user selected fields only
    for (let i = 0; i < field_length; i++) {
      let logObj = Object.assign({}, FIEL);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.field[i].field_id;
      logObj.field_name = log.field[i].field_name;
      logObj.field_area_m2 = log.field[i].area;
      logObj.notes = log.notes;

      logObj.field_work_type = fieldWorkDetail[0].type;
      processed.push(logObj);
    }

  }

  return processed;

};

const processSoil = async (log) => {
  let field_length = log['field'].length;

  let activity_id = log.activity_id;
  let soilDetail = await baseController.getIndividual(soilDataModel, activity_id);

  let processed = [];

  for (let i = 0; i < field_length; i++) {
    let logObj = Object.assign({}, SOIL);
    logObj.activity_id = log.activity_id;
    logObj.activity_kind = log.activity_kind;
    logObj.first_name = log.first_name;
    logObj.last_name = log.last_name;
    logObj.user_id = log.user_id;
    logObj.date = log.date;
    logObj.photo = log.photo;
    logObj.field_id = log.field[i].field_id;
    logObj.field_name = log.field[i].field_name;
    logObj.field_area_m2 = log.field[i].area;
    logObj.notes = log.notes;

    logObj.soil_texture = soilDetail[0].texture;
    logObj.soil_k = soilDetail[0].k;
    logObj.soil_p = soilDetail[0].p;
    logObj.soil_n = soilDetail[0].n;
    logObj.soil_om = soilDetail[0].om;
    logObj.soil_ph = soilDetail[0].ph;
    logObj.soil_bulk_density_kg_per_m3 = soilDetail[0]['bulk_density_kg/m3'];
    logObj.soil_organic_carbon = soilDetail[0].organic_carbon;
    logObj.soil_inorganic_carbon = soilDetail[0].inorganic_carbon;
    logObj.soil_s = soilDetail[0].s;
    logObj.soil_ca = soilDetail[0].ca;
    logObj.soil_mg = soilDetail[0].mg;
    logObj.soil_zn = soilDetail[0].zn;
    logObj.soil_mn = soilDetail[0].mn;
    logObj.soil_fe = soilDetail[0].fe;
    logObj.soil_cu = soilDetail[0].cu;
    logObj.soil_b = soilDetail[0].b;
    logObj.soil_c = soilDetail[0].c;
    logObj.soil_cec = soilDetail[0].cec;
    logObj.soil_na = soilDetail[0].na;
    logObj.soil_total_carbon = soilDetail[0].total_carbon;
    logObj.soil_depth_cm = soilDetail[0].depth_cm;

    processed.push(logObj);
  }

  return processed;

};

const processIrri = async (log) => {
  let field_length = log['field'].length;
  let crop_length = log['fieldCrop'].length;

  let processed = [];

  let activity_id = log.activity_id;
  let irriDetail = await baseController.getIndividual(irriModel, activity_id);

  if (crop_length === 0) {
    // Here: no crop, user selected fields only
    for (let i = 0; i < field_length; i++) {
      let logObj = Object.assign({}, IRRI);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.field[i].field_id;
      logObj.field_name = log.field[i].field_name;
      logObj.field_area_m2 = log.field[i].area;
      logObj.notes = log.notes;

      logObj.irrigation_type = irriDetail[0].type;
      logObj.irri_flow_rate = irriDetail[0]['flow_rate_l/min'];
      logObj.irri_flow_rate_unit = irriDetail[0].flow_rate_unit;
      logObj.irri_hours = irriDetail[0].hours;

      processed.push(logObj);
    }

  } else if (crop_length > 0) {
    // has crop so we ignore fields

    for (let i = 0; i < crop_length; i++) {
      let logObj = Object.assign({}, IRRI);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.fieldCrop[i].field_id;

      let nameArea = getFieldNameNArea(log.fieldCrop[i].field_id, log.field);
      logObj.field_name = nameArea[0];
      logObj.field_area_m2 = nameArea[1];

      logObj.notes = log.notes;

      logObj.field_crop_id = log.fieldCrop[i].field_crop_id;
      logObj.crop_common_name = log.fieldCrop[i].crop.crop_common_name;

      logObj.irrigation_type = irriDetail[0].type;
      logObj.irri_flow_rate = irriDetail[0]['flow_rate_l/min'];
      logObj.irri_flow_rate_unit = irriDetail[0].flow_rate_unit;
      logObj.irri_hours = irriDetail[0].hours;

      processed.push(logObj);
    }
  }

  return processed;

};

const processScout = async (log) => {
  let field_length = log['field'].length;
  let crop_length = log['fieldCrop'].length;

  let processed = [];

  let activity_id = log.activity_id;
  let scoutDetail = await baseController.getIndividual(scoutModel, activity_id);

  if (crop_length === 0) {
    // Here: no crop, user selected fields only
    for (let i = 0; i < field_length; i++) {
      let logObj = Object.assign({}, SCOUT);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.field[i].field_id;
      logObj.field_name = log.field[i].field_name;
      logObj.field_area_m2 = log.field[i].area;
      logObj.notes = log.notes;

      logObj.scout_type = scoutDetail[0].type;

      processed.push(logObj);
    }

  } else if (crop_length > 0) {
    // has crop so we ignore fields

    for (let i = 0; i < crop_length; i++) {
      let logObj = Object.assign({}, SCOUT);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.fieldCrop[i].field_id;

      let nameArea = getFieldNameNArea(log.fieldCrop[i].field_id, log.field);
      logObj.field_name = nameArea[0];
      logObj.field_area_m2 = nameArea[1];

      logObj.notes = log.notes;

      logObj.field_crop_id = log.fieldCrop[i].field_crop_id;
      logObj.crop_common_name = log.fieldCrop[i].crop.crop_common_name;

      logObj.scout_type = scoutDetail[0].type;

      processed.push(logObj);
    }
  }

  return processed;

};

const processOther = async (log) => {
  let field_length = log['field'].length;
  let crop_length = log['fieldCrop'].length;

  let processed = [];

  if (crop_length === 0) {
    // Here: no crop, user selected fields only
    for (let i = 0; i < field_length; i++) {
      let logObj = Object.assign({}, OTHER);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.field[i].field_id;
      logObj.field_name = log.field[i].field_name;
      logObj.field_area_m2 = log.field[i].area;
      logObj.notes = log.notes;

      processed.push(logObj);
    }

  } else if (crop_length > 0) {
    // has crop so we ignore fields

    for (let i = 0; i < crop_length; i++) {
      let logObj = Object.assign({}, OTHER);
      logObj.activity_id = log.activity_id;
      logObj.activity_kind = log.activity_kind;
      logObj.first_name = log.first_name;
      logObj.last_name = log.last_name;
      logObj.user_id = log.user_id;
      logObj.date = log.date;
      logObj.photo = log.photo;
      logObj.field_id = log.fieldCrop[i].field_id;

      let nameArea = getFieldNameNArea(log.fieldCrop[i].field_id, log.field);
      logObj.field_name = nameArea[0];
      logObj.field_area_m2 = nameArea[1];

      logObj.notes = log.notes;

      logObj.field_crop_id = log.fieldCrop[i].field_crop_id;
      logObj.crop_common_name = log.fieldCrop[i].crop.crop_common_name;

      processed.push(logObj);
    }
  }

  return processed;

};

const processLogs = async (farm_id) => {
  try {
    let allLogs = await logServices.getLogByFarm(farm_id);
    //console.log(JSON.stringify(allLogs));
    let fertLogs = [], pestLogs = [], harvLogs = [], seedLogs = [], fieldLogs = [], soilLogs = [], irriLogs = [],
      scoutLogs = [], otherLogs = [];

    for (let log of allLogs) {
      if (log.activity_kind === 'fertilizing') {
        let processed = await processFert(log);
        fertLogs = fertLogs.concat(processed);
      }
      else if (log.activity_kind === 'pestControl') {
        let processed = await processPest(log);
        pestLogs = pestLogs.concat(processed);
      }
      else if (log.activity_kind === 'harvest') {
        let processed = await processHarv(log);
        harvLogs = harvLogs.concat(processed);
      }
      else if (log.activity_kind === 'seeding') {
        let processed = await processSeed(log);
        seedLogs = seedLogs.concat(processed);
      }
      else if (log.activity_kind === 'fieldWork') {
        let processed = await processFieldWork(log);
        fieldLogs = fieldLogs.concat(processed);
      }
      else if (log.activity_kind === 'soilData') {
        let processed = await processSoil(log);
        soilLogs = soilLogs.concat(processed);
      }
      else if (log.activity_kind === 'irrigation') {
        let processed = await processIrri(log);
        irriLogs = irriLogs.concat(processed);
      }
      else if (log.activity_kind === 'scouting') {
        let processed = await processScout(log);
        scoutLogs = scoutLogs.concat(processed);
      }
      else if (log.activity_kind === 'other') {
        let processed = await processOther(log);
        otherLogs = otherLogs.concat(processed);
      }
    }

    await saveJson(fertLogs, 'fertilizing_logs', Object.keys(FERT));
    await saveJson(pestLogs, 'pesticide_logs', Object.keys(PEST));
    await saveJson(harvLogs, 'harvest_logs', Object.keys(HARV));
    await saveJson(seedLogs, 'seed_logs', Object.keys(SEED));
    await saveJson(fieldLogs, 'field_work_logs', Object.keys(FIEL));
    await saveJson(soilLogs, 'soil_data_logs', Object.keys(SOIL));
    await saveJson(irriLogs, 'irrigation_logs', Object.keys(IRRI));
    await saveJson(scoutLogs, 'scouting_logs', Object.keys(SCOUT));
    await saveJson(otherLogs, 'other_logs', Object.keys(OTHER));


  }
  catch (err) {
    throw err;
  }
};

const saveJson = async (jsonContent, fileName, keys) => {
  let csv;
  try {
    csv = await converter.json2csvAsync(jsonContent, {'expandArrayObjects': true, keys});
    await fs.writeFile(__dirname + `/temp_files/${fileName}.csv`, csv, 'utf8');
    // console.log(`Saved file ${fileName}`);
  }
  catch (error) {
    console.log(error);
    throw error;
  }
};

const grabFarmIDsToRun = async () => {
  const data = await knex.raw(`SELECT f.farm_id, f.request_number, f.user_id
  FROM "farmDataSchedule" f
  WHERE f.is_processed = FALSE AND f.has_failed = FALSE
  `);
  return data.rows
};

const getUserEmail = async (user_id) => {
  const data = await knex.raw(`SELECT u.email
  FROM "users" u
  WHERE u.user_id = '${user_id}'
  `);
  return data.rows[0].email;
};

const cleanFiles = async () => {
  const directory = __dirname + '/temp_files';
  try {
    await fse.emptyDir(directory);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = sendUserFarmDataScheduler;

