/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (dummy.js) is part of LiteFarm.
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

const dummy = {
  mockPlan: {
    plan_config: {},
  },

  mockFarm : {
    farm_name: 'happy land',
    address: '12359 fake st',
    sandbox_bool: false,
  },

  mockFarmPut : {
    farm_name: 'sad land',
  },

  notExistFarm : {
    farm_name: 'NA',
    address: 'bad address',
    sandbox_bool: false,
  },

  mockType : {
    task_name: 'water plant',
  },

  mockTypePut : {
    task_id: 123,
    task_name: 'weeds removal',
  },

  notExistTaskType : {
    task_id: 999,
    task_name: 'harvest',
  },

  mockField : {
    grid_points:
        [
          { lat:1, lng:2 },
          { lat:1, lng:2 },
          { lat:1, lng:2 },
          { lat:1, lng:2 },
          { lat:1, lng:2 },
        ],
  },

  mockFieldPut:{
    grid_points:
        [
          { lat:1, lng:2 },
          { lat:1, lng:2 },
          { lat:1, lng:2 },
          { lat:1, lng:2 },
          { lat:1, lng:2 },
        ],
  },

  mockFieldID:{
    'field_id': 223,
    'grid_points':{
      'lon': 134.5212,
      'lat': 72.5912,
    },
    'path_width': 111.123,
    'bed_width': 124.2,
    'is_bed_width_horizontal': false,
  },

  mockUser:{
    'last_name': 'ever',
    'first_name': 'greatest',
    'email': 'haha@gmail.com',
    'is_admin': false,
    'user_id': '1c42b718-83cd-11e8-b158-e0accb890fd2',
  },

  mockUserDuplicateEmail:{
    user_id: 'a2696112-0214-4ce4-84fc-df61b1472d3b',
  },

  mockUserPut:{
    'user_id' : '1c42b718-83cd-11e8-b158-e0accb890fd2',
    'last_name': 'food',
    'first_name': 'greatest',
    'email': 'haha@gmail.com',
    'is_admin': false,
  },

  notExistUser:{
    'user_id' : '1c42b718-83cd-11e8-b158-e0accb890fd21244',
    'last_name': 'heavy',
    'first_name': 'farm',
    'email': 'haha@gmail.com',
    'is_admin': false,
  },

  mockShift:{
    'shift_type': 'other',
    'start_time': '1997-07-16T19:20+01:00',
    'end_time': '1998-07-16T19:20+01:00',
    'user_id': '5b515beef7ac1b2c61285039',
  },

  mockShiftTask:{
    'task_id': 123,
    'field_crop_id': 555,
  },

  mockTaskType:{
    'task_name': 'replace queen bee',
  },

  cropResponse:{
    'crop_id': '20',
    'crop_common_name': 'Beans, harvested green',
    'crop_genus': 'Vig',
    'crop_specie': 'spp.',
    'crop_group': 'Leguminous crops',
    'crop_subgroup': 'Legumes',
    'max_rooting_depth': 0.77,
    'depletion_fraction': 0.5,
    'is_avg_depth': true,
    'initial_kc': 0.4,
    'mid_kc': 1.15,
    'end_kc': 0.55,
    'max_height': null,
    'is_avg_kc': true,
    'nutrient_notes': null,
    'percentrefuse': null,
    'refuse': null,
    'protein': 7.6,
    'lipid': 0.4,
    'energy': 110,
    'ca': 36,
    'fe': 1.5,
    'mg': 43,
    'ph': 125,
    'k': 268,
    'na': 5,
    'zn': 1.01,
    'cu': 0.259,
    'fl': 9999,
    'mn': 0.421,
    'se': 2.6,
    'vita_rae': 3,
    'vite': 0.02,
    'vitc': 0.3,
    'thiamin': 0.097,
    'riboflavin': 0.089,
    'niacin': 0.711,
    'pantothenic': 0.157,
    'vitb6': 0.072,
    'folate': 104,
    'vitb12': 0,
    'vitk': 2.9,
    'is_avg_nutrient': true,
    'farm_id': null,
    'user_added': false,
    'deleted': false,
  },

  mockCrop: {
    'crop_common_name': 'Tide pods',
    'crop_group': 'Other crops',
    'crop_subgroup': 'Rubber',
    'quantity_kg' : 50,
    'vitc': 500,
    'vita_rae': 200,
    'percentrefuse': 20,
    'lipid': 500,
    'ca': 200,
  },

  mockSaleAndCropSale: {
    customer_name: 'test',
    sale_date: '1997-07-16T19:20+01:00',
  },

  auth: { grant_type: 'password',
    audience: process.env.CI ? 'https://litefarm.com/api/v1/' : 'https://litefarm.com/api/v1',
    client_id: process.env.CI_CLIENT_ID,
    client_secret: process.env.CI_CLIENT_SECRET,
    username: process.env.TEST_USER,
    password: process.env.TEST_USER_PW,
  },

  testUser: {
    email: process.env.TEST_USER,
    first_name: 'test',
    last_name: 'user',
    is_admin: true,
    user_id: process.env.TEST_USER_ID,
    farm_id: null,
  },

  testFarm: {
    farm_id: '5be5faae-d608-4700-8b05-ae08e9edf747',
  },

  testNitrogenBalance: {
    scheduled_at: new Date(),
    farm_id: '5be5faae-d608-4700-8b05-ae08e9edf747',
  },

};

module.exports = dummy;
