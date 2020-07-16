/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (generalFarmSeedData.js) is part of LiteFarm.
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

require('dotenv').config();

const seedFarmData = [
  {
    table: 'farm',
    data: {
      farm_id: '5be5faae-d608-4700-8b05-ae08e9edf747',
      farm_name: 'Test Farm',
      units: {
        currency: 'CAD',
        measurement: 'metric',
        date_format: 'MM/DD/YY',
      },
    },
  },

  {
    table: 'users',
    data: {
      email: process.env.TEST_USER,
      first_name: 'test',
      last_name: 'user',
      is_admin: true,
      user_id: process.env.TEST_USER_ID,
      farm_id: '5be5faae-d608-4700-8b05-ae08e9edf747',
    },
  },

  {
    table: 'activityLog',
    data: {
      activity_id: 100,
      activity_kind: 'other',
      date: '2018-09-30 21:26:02.536-07',
      user_id: '5b515beef7ac1b2c61285039',
      notes: '',
      action_needed: false,
    },
  },

  {
    table: 'field',
    data: {
      field_id: 'ad949da6-a4f8-4521-95ff-6a9073e71a0b',
      farm_id: '5be5faae-d608-4700-8b05-ae08e9edf747',
      field_name: 'Test Field',
      grid_points: JSON.stringify([
        { lat: 49.25148925443262, lng: -123.24001308685746 },
        { lat: 49.250054989957334, lng: -123.24128338098143 },
        { lat: 49.24765698722413, lng: -123.2366485238037 },
        { lat: 49.24933784209375, lng: -123.23462291968661 },
      ]),
      area: 100000,
    },
  },

  {
    table: 'fieldCrop',
    data: [{
      field_crop_id: 100,
      field_id: 'ad949da6-a4f8-4521-95ff-6a9073e71a0b',
      crop_id: 101,
      start_date: '2018-09-24 03:04:00-07',
      end_date: '2019-09-24 04:04:00-07',
      area_used: 50,
      estimated_production: 500,
      estimated_revenue: 50000,
    }, {
      field_crop_id: 101,
      field_id: 'ad949da6-a4f8-4521-95ff-6a9073e71a0b',
      crop_id: 102,
      start_date: '2018-09-24 03:04:00-07',
      end_date: '2019-09-24 04:04:00-07',
      area_used: 50,
      estimated_production: 500,
      estimated_revenue: 50000,
    }],
  },

  {
    table: 'shift',
    data: {
      shift_id: '59f720da-d774-11e8-92b1-88e9fe7badb4',
      start_time: '2018-09-24 03:04:00-07',
      end_time: '2018-09-24 04:04:00-07',
      user_id: '5b515beef7ac1b2c61285039',
      break_duration: 0,
    },
  },

  {
    table: 'sale',
    data: {
      sale_id: 100,
      customer_name: 'sheldon',
      sale_date: '2019-09-30 21:26:02.536-07',
    },
  },

  {
    table: 'shiftTask',
    data: {
      task_id: 5,
      shift_id: '59f720da-d774-11e8-92b1-88e9fe7badb4',
      field_crop_id: 100,
      field_id: 'ad949da6-a4f8-4521-95ff-6a9073e71a0b',
      duration: 30,
    },
  },

  {
    table: 'activityCrops',
    data: {
      activity_id: 100,
      field_crop_id: 100,
    },
  },

  {
    table: 'activityFields',
    data: {
      activity_id: 100,
      field_id: 'ad949da6-a4f8-4521-95ff-6a9073e71a0b',
    },
  },

  {
    table: 'cropSale',
    data: {
      sale_id: 100,
      field_crop_id: 100,
      quantity_kg: 1,
      sale_value: 100,
    },
  },

  {
    table: 'price',
    data: [{
      crop_id: 101,
      'value_$/kg': 100,
      date: '2019-09-30 21:26:02.536-07',
      farm_id: '5be5faae-d608-4700-8b05-ae08e9edf747',
    }, {
      crop_id: 100,
      'value_$/kg': 100,
      date: '2019-09-30 21:26:02.536-07',
      farm_id: '5be5faae-d608-4700-8b05-ae08e9edf747',
    }],
  },

  {
    table: 'yield',
    data: [{
      crop_id: 101,
      'quantity_kg/m2': 10,
      date: '2019-09-30 21:26:02.536-07',
      farm_id: '5be5faae-d608-4700-8b05-ae08e9edf747',
    }, {
      crop_id: 100,
      'quantity_kg/m2': 10,
      date: '2019-09-30 21:26:02.536-07',
      farm_id: '5be5faae-d608-4700-8b05-ae08e9edf747',
    }],
  },
];

module.exports = seedFarmData;
