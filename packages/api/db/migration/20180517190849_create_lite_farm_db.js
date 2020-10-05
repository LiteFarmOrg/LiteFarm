/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20180517190849_create_lite_farm_db.js) is part of LiteFarm.
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

exports.up = async function(knex) {
  //Add all the tables for DB
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  return Promise.all([
    knex.schema.createTable('farm', function (table) {
      table.uuid('farm_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
      table.string('farm_name').notNullable();
      table.string('address');
      table.jsonb('phone_number');
      table.jsonb('units').defaultTo(JSON.stringify({
        measurement: 'metric',
        currency: 'CAD',
        date_format: 'MM/DD/YY',
      }));
    }),

    knex.schema.createTable('users', function (table) {
      table.string('user_id').primary();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('profile_picture');
      table.string('email')
        .unique()
        .notNullable();
      table.string('phone_number')
        .nullable();
      table.string('address')
        .nullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm');
      table.boolean('is_admin').notNullable().defaultTo(false);
      table.jsonb('notification_setting').defaultTo(JSON.stringify(
        {
          alert_weather : true,
          alert_worker_finish : true,
          alert_action_after_scouting : true,
          alert_before_planned_date : true,
          alert_pest: true,
        }
      ));
      table.jsonb('wage').defaultTo(JSON.stringify(
        {
          type: 'hourly',
          amount: 0,
        }
      ));
      table.timestamps(false, true);
    }),

    //Notification Table
    knex.schema.createTable('notification', function (table) {
      table.uuid('notification_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
      table.string('user_id').references('user_id').inTable('users');
      table.enu('notification_kind', ['todo_added','alert_weather', 'alert_worker_finish', 'alert_action_after_scouting', 'alert_before_planned_date', 'alert_pest']).notNullable();
      table.boolean('is_read').notNullable().defaultTo(false);
      table.timestamps(false, true);
    }),

    //Is this the correct way to make the primary keys?
    knex.schema.createTable('userManages', function (table) {
      table.string('manager_id')
        .references('user_id')
        .inTable('users');
      table.string('manages_id')
        .references('user_id')
        .inTable('users');
      table.primary(['manages_id', 'manager_id']);
    }),

    knex.schema.createTable('field', function (table) {
      table.uuid('field_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm');
      table.unique(['field_id', 'farm_id']);
      table.jsonb('grid_points');
    }),

    knex.schema.createTable('bed', function (table) {
      table.uuid('bed_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
      table.uuid('field_id')
        .references('field_id')
        .inTable('field').onDelete('CASCADE');
      table.float('bed_length').unsigned();
      table.integer('bed_index_in_field').unsigned().notNullable();

      table.index(['field_id']); //TODO: see if this works
    }),

    knex.schema.createTable('crop', function (table) {
      table.increments('crop_id');
      table.string('crop_common_name'); //same as common name crop_scientific_name,crop_common_name
      table.string('crop_genus'); //scientific name
      table.string('crop_specie'); //scientific name //crop_genus,crop_specie
      table.unique(['crop_common_name', 'crop_genus', 'crop_specie']); //index?
      table.enu('crop_group',
        ['Other crops', 'Fruit and nuts', 'Beverage and spice crops', 'Potatoes and yams'
          , 'Vegetables and melons', 'Cereals', 'Leguminous crops', 'Sugar crops', 'Oilseed crops']); //TODO: ??
      table.enu('crop_subgroup',
        ['Fibre crops', 'Grasses and other fodder crops', 'Nuts',
          'Temporary spice crops', 'Pome fruits and stone fruits', 'Other crops',
          'High starch Root/tuber crops', 'Leafy or stem vegetables',
          'Tropical and subtropical fruits',
          'Cereals', 'Legumes', 'Sugar crops (root)',
          'Citrus fruits', 'Permanent spice crops',
          'Berries', 'Fruit-bearing vegetables', 'Other fruits',
          'Root, bulb, or tuberous vegetables', 'Temporary oilseed crops',
          'Permanent oilseed crops', 'Medicinal, aromatic, pesticidal, or similar crops',
          'Grapes', 'Flower crops', 'Mushrooms and truffles', 'Rubber', 'Sugar crops (other)',
          'Tobacco']);
      table.float('max_rooting_depth');
      table.float('depletion_fraction');
      table.boolean('is_avg_depth').defaultTo(false).notNullable();
      table.float('initial_kc');
      table.float('mid_kc');
      table.float('end_kc');
      table.float('max_height');
      table.boolean('is_avg_kc');
      table.string('nutrient_notes');
      table.float('percentrefuse');
      table.string('refuse');
      table.float('protein');
      table.float('lipid');
      table.float('energy');
      table.float('ca');
      table.float('fe');
      table.float('mg');
      table.float('ph');
      table.float('k');
      table.float('na');
      table.float('zn');
      table.float('cu');
      table.float('fl');
      table.float('mn');
      table.float('se');
      table.float('vita_rae');
      table.float('vite');
      table.float('vitc');
      table.float('thiamin');
      table.float('riboflavin');
      table.float('niacin');
      table.float('pantothenic');
      table.float('vitb6');
      table.float('folate');
      table.float('vitb12');
      table.float('vitk');
      table.boolean('is_avg_nutrient').defaultTo(false)
        .notNullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').defaultTo(null);

      table.boolean('user_added').defaultTo(false).notNullable();
      table.boolean('deleted')
        .defaultTo(false);
      //TODO: add other stuff
    }),


    /*
    scientific_name (species),
    common_name,
    crop_group,
    crop_subgroup,
    max_rooting_depth,
    ,
    ,initial_kc,
    mid_kc,end_kc,max_height,is_avg_kc,nutrient_notes,percentrefuse,refuse,protein,lipid,energy,ca,fe,mg,ph,k,na,zn,cu,fl,mn,se,vita_rae,vite,vitc,thiamin,riboflavin,niacin,pantothenic,vitb6,folate,vitb12,vitk,is_avg_nutrient
    */

    knex.schema.createTable('farmCrop', function (table) {
      table.increments('farm_crop_id');
      table.integer('crop_id')
        .references('crop_id')
        .inTable('crop').notNullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').notNullable();
      table.float('expected_yield');
      table.string('variety');
      table.unique(['crop_id', 'farm_id', 'variety']);
    }),

    /*knex.schema.createTable('farmCropConfig', function (table) {
      table.integer('farm_crop_id')
        .references('farm_crop_id')
        .inTable('farmCrop')
        .primary();
      table.float('expected_yield');
    }),*/

    knex.schema.createTable('cropBed', function (table) {
      table.integer('farm_crop_id')
        .references('farm_crop_id')
        .inTable('farmCrop');
      table.uuid('bed_id')
        .references('bed_id')
        .inTable('bed');
      table.float('length').notNullable();
      table.integer('crop_bed_index_in_bed').notNullable();
      table.primary(['bed_id', 'farm_crop_id']);
    }),

    knex.schema.createTable('cropCommonName', function (table) {
      table.string('crop_name');
      table.bigint('crop_id')
        .references('crop_id')
        .inTable('crop');
    }),

    knex.schema.createTable('disease', function (table) {
      table.increments('disease_id');
      table.string('disease_scientific_name').nullable();
      table.string('disease_common_name');
      table.enu('disease_group', ['Fungus', 'Insect', 'Bacteria', 'Virus', 'Deficiency', 'Mite', 'Other', 'Weed']); //TODO: is going to be
      //table.unique(['disease_scientific_name', 'disease_common_name']);
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').defaultTo(null);
    }),

    knex.schema.createTable('cropDisease', function (table) {
      table.integer('disease_id')
        .references('disease_id')
        .inTable('disease');
      table.integer('crop_id')
        .references('crop_id')
        .inTable('crop');
      table.primary(['disease_id', 'crop_id']);
    }),

    knex.schema.createTable('sale', function (table) {
      table.increments('sale_id');
      table.string('customer_name').notNullable();
      table.dateTime('sale_date').notNullable();
    }),

    knex.schema.createTable('plan', function (table) {
      table.uuid('plan_id').primary();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm');
      table.jsonb('plan_config').notNullable();
    }),

    knex.schema.createTable('cropSale', function (table) {
      table.integer('farm_crop_id')
        .references('farm_crop_id')
        .inTable('farmCrop').onDelete('CASCADE');
      table.integer('sale_id')
        .references('sale_id')
        .inTable('sale').onDelete('CASCADE');
      table.integer('quantity').unsigned();
      table.integer('sale_value');
    }),

    knex.schema.createTable('farmExpenseType', function (table) {
      table.increments('expense_type_id');
      table.string('expense_name');
      table.boolean('user_added')
        .defaultTo(false);
    }),

    knex.schema.createTable('farmExpense', function (table) {
      table.uuid('farm_expense_id').primary();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm');
      table.integer('expense_type_id')
        .references('expense_type_id')
        .inTable('farmExpenseType');
      table.dateTime('expense_date').notNullable();
      table.integer('value').notNullable().unsigned();
      table.string('picture');
      table.string('note');
    }),

    knex.schema.createTable('shift', function (table) {
      table.uuid('shift_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
      // table.enu('shift_type', ['bedPreparation', 'delivery', 'sales', 'washingAndPacking',
      //   'seeding', 'fertilizing', 'scouting', 'harvesting', 'weeding',
      //   'socialEvent', 'pestAndDiseaseControl', 'other']);
      table.dateTime('start_time').notNullable();
      table.dateTime('end_time').notNullable();
      table.string('user_id')
        .references('user_id')
        .inTable('users');
      table.integer('break_duration').defaultTo(0);
      table.enu('mood', ['happy', 'neutral', 'very happy', 'sad', 'very sad']).nullable();
    }),

    knex.schema.createTable('taskType', function (table) {
      table.increments('task_id').primary();
      table.string('task_name').notNullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').defaultTo(null);
    }),

    knex.schema.createTable('shiftTask', function (table) {
      table.integer('task_id')
        .references('task_id')
        .inTable('taskType');
      table.uuid('shift_id')
        .references('shift_id')
        .inTable('shift');
      table.integer('farm_crop_id')
        .references('farm_crop_id')
        .inTable('farmCrop').notNullable();
      table.boolean('is_field').defaultTo(false);
      table.uuid('field_id')
        .references('field_id')
        .inTable('field').onDelete('CASCADE').nullable();
      table.integer('duration').notNullable();
    }),

    knex.schema.createTable('todo', function (table) {
      table.increments('todo_id').primary();
      table.string('todo_text').notNullable();
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm');
      table.boolean('is_done').defaultTo(false);
    }),

    knex.schema.createTable('userTodo', function (table) {
      table.integer('todo_id')
        .references('todo_id')
        .inTable('todo');
      table.string('user_id')
        .references('user_id')
        .inTable('users');
      table.primary(['todo_id', 'user_id']);
    }),

    knex.schema.createTable('activityLog', function (table) {
      table.increments('activity_id').primary();
      table.enu('activity_kind', ['fertilizing', 'pestControl', 'scouting', 'irrigation', 'harvest', 'seeding', 'fieldWork', 'weatherData', 'soilData', 'other']);
      table.dateTime('date').notNullable();
      table.string('user_id')
        .references('user_id')
        .inTable('users').notNullable();
      table.string('notes');
      table.boolean('action_need')
        .defaultTo(false);
      table.string('photo');
    }),

    knex.schema.createTable('activityBeds', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .onDelete('CASCADE');
      table.uuid('bed_id')
        .references('bed_id')
        .inTable('bed');
      table.primary(['bed_id', 'activity_id']);
    }),

    knex.schema.createTable('activityFields', function(table){
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .onDelete('CASCADE');
      table.uuid('field_id')
        .references('field_id')
        .inTable('field').onDelete('CASCADE');
      table.primary(['field_id', 'activity_id']);
    }),

    knex.schema.createTable('activityCrops', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .onDelete('CASCADE');
      table.integer('farm_crop_id')
        .references('farm_crop_id')
        .inTable('farmCrop');
      table.float('quantity').unsigned();
      table.enu('quantity_unit', ['lb', 'kg']).defaultTo('kg');
      table.primary(['activity_id', 'farm_crop_id']);
    }),

    knex.schema.createTable('fertilizer', function (table) {
      table.increments('fertilizer_id');
      table.string('fertilizer_type');
      table.float('moisture_percentage');
      table.float('n_percentage');
      table.float('nh4_n_ppm');
      table.float('p_percentage');
      table.float('k_percentage');
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').defaultTo(null);
    }),

    knex.schema.createTable('scoutingLog', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .primary()
        .onDelete('CASCADE');
      table.enu('type', ['harvest', 'pest', 'disease', 'weed', 'other']);
    }),

    knex.schema.createTable('fieldworkLog', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .primary()
        .onDelete('CASCADE');
      table.enu('type', ['plow', 'ridgeTill', 'zoneTill', 'mulchTill', 'ripping', 'discing']);
    }),

    knex.schema.createTable('fertilizerLog', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .primary()
        .onDelete('CASCADE');
      table.integer('fertilizer_id')
        .references('fertilizer_id')
        .inTable('fertilizer');
      table.integer('quantity');
      table.enu('quantity_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
    }),

    /*
    Going to do the no3 and nh4 the dirty way for now
    knex.schema.createTable('fertilizerLogConfig', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog');
      table.string('name');
      table.float('value');
      table.primary(['activity_id', 'name']);
    }),*/

    knex.schema.createTable('irrigationLog', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .primary()
        .onDelete('CASCADE');
      table.enu('type', ['sprinkler', 'drip', 'subsurface', 'flood']);
      table.float('flow_rate');
      table.enu('flow_rate_unit', ['l/min', 'l/hr', 'gal/min', 'gal/hr']).defaultTo('l/min');
      table.float('hours');
    }),

    knex.schema.createTable('seedLog', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .primary()
        .onDelete('CASCADE');
      table.enu('type', []);
      table.string('product_name').notNullable();
      table.float('space_depth');
      table.float('space_length');
      table.float('space_width');
      table.float('rate');
      table.enu('space_unit', ['cm', 'in']);
      table.enu('rate_unit', ['units/m2', 'units/ft2']);
    }),

    knex.schema.createTable('pesticide', function (table) {
      table.increments('pesticide_id');
      table.string('pesticide_name');
      table.float('entry_interval').defaultTo(0);
      table.float('harvest_interval').defaultTo(0);
      table.string('active_ingredients').nullable();
      table.float('concentration').defaultTo(0);
      table.uuid('farm_id')
        .references('farm_id')
        .inTable('farm').defaultTo(null);
    }),

    knex.schema.createTable('pestControlLog', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .primary()
        .onDelete('CASCADE');
      table.integer('pesticide_id')
        .references('pesticide_id')
        .inTable('pesticide');
      table.float('quantity').unsigned().notNullable();
      table.enu('quantity_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
      table.enu('type', ['systemicSpray', 'foliarSpray', 'handPick', 'biologicalControl', 'burning', 'soilFumigation', 'heatTreatment']).notNullable();
      table.integer('target_disease_id')
        .references('disease_id')
        .inTable('disease');
    }),

    knex.schema.createTable('soilDataLog', function (table) {
      table.integer('activity_id')
        .references('activity_id')
        .inTable('activityLog')
        .primary()
        .onDelete('CASCADE');
      table.float('start_depth');
      table.float('end_depth');
      table.enu('depth', ['cm', 'in']);
      table.enu('texture', ['sand', 'loamySand', 'sandyLoam', 'loam',
        'siltLoam', 'silt', 'sandyClayLoam', 'clayLoam', 'siltyClayLoam',
        'sandyClay', 'siltyClay', 'clay']);
      table.float('k');
      table.float('p');
      table.float('n');
      table.float('om');
      table.float('ph'); //won't have any units
      table.float('bulk_density');
      table.enu('bulk_density_unit', ['g/cm3', 'lb/inch3']);
      table.float('organic_carbon');
      table.float('inorganic_carbon');
      table.float('s');
      table.float('ca');
      table.float('mg');
      table.float('zn');
      table.float('mn');
      table.float('fe');
      table.float('cu');
      table.float('b');
      table.float('cec');
      table.enu('units', ['percentage', 'mg/kg', 'ounces/lb']);
    }),
  ])
};

exports.down = function(knex) {
  //remove all the tables
  return Promise.all([
    knex.schema.dropTable('soilDataLog'),
    knex.schema.dropTable('pestControlLog'),
    knex.schema.dropTable('pesticide'),
    knex.schema.dropTable('seedLog'),
    knex.schema.dropTable('irrigationLog'),
    // knex.schema.dropTable('fertilizerLogConfig'),
    knex.schema.dropTable('fertilizerLog'),
    knex.schema.dropTable('fieldworkLog'),
    knex.schema.dropTable('scoutingLog'),
    knex.schema.dropTable('fertilizer'),
    knex.schema.dropTable('activityCrops'),
    knex.schema.dropTable('activityBeds'),
    knex.schema.dropTable('notification'),
    knex.schema.dropTable('userTodo'),
    knex.schema.dropTable('todo'),
    knex.schema.dropTable('shiftTask'),
    knex.schema.dropTable('taskType'),
    knex.schema.dropTable('shift'),
    knex.schema.dropTable('farmExpense'),
    knex.schema.dropTable('cropSale'),
    knex.schema.dropTable('sale'),
    knex.schema.dropTable('plan'),
    knex.schema.dropTable('cropDisease'),
    knex.schema.dropTable('disease'),
    knex.schema.dropTable('cropCommonName'),
    knex.schema.dropTable('cropBed'),
    knex.schema.dropTable('farmExpenseType'),
    knex.schema.dropTable('farmCrop'),
    knex.schema.dropTable('crop'),
    knex.schema.dropTable('bed'),
    knex.schema.dropTable('userManages'),
    knex.schema.dropTable('activityFields'),
    knex.schema.dropTable('field'),
    knex.schema.dropTable('activityLog'),
    knex.schema.dropTable('users'),
    knex.schema.dropTable('farm'),
  ])
};
