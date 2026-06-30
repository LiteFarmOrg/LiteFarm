/*
 *  Copyright 2025 LiteFarm.org
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

import { faker } from '@faker-js/faker';
import knex from '../../src/util/knex.js';
import { setupSoilAmendmentTaskDependencies } from './testDataSetup.js';
import mocks from '../mock.factories.js';

// field_work_task
const getFieldWorkTaskNewTypeTestCase = (fieldWorkName) => {
  return {
    getFakeCompletionData: (initialData) => ({
      field_work_task: {
        task_id: initialData.task_id,
        field_work_task_type: {
          label: 'Other',
          value: 'OTHER',
          field_work_name: fieldWorkName,
        },
      },
    }),
    getExpectedData: async () => {
      const { field_work_type_id } = await knex('field_work_type')
        .where({ field_work_name: fieldWorkName })
        .first();

      return { field_work_type_id };
    },
  };
};
const fieldWorkTaskTestCases = {
  newFieldWorkType: {
    initialData: undefined, // No initial data passed; use factory default
    ...getFieldWorkTaskNewTypeTestCase(faker.lorem.word()),
  },
};

// pest_control_task
const pestControlTaskInitialDataWithProduct = {
  weight: 2,
  weight_unit: 'kg',
  pest_target: 'Aphids',
  control_method: 'foliarSpray',
};
const pestControlTaskTestCases = {
  changeToMethodWithoutProduct: {
    initialData: pestControlTaskInitialDataWithProduct,
    getFakeCompletionData: (initialData) => ({
      pest_control_task: {
        task_id: initialData.task_id,
        product_id: null,
        product_quantity: null,
        product_quantity_unit: null,
        pest_target: null,
        control_method: 'biologicalControl',
      },
    }),
    getExpectedData: async () => {
      return {
        product_id: null,
        weight: null,
        weight_unit: null,
        volume: null,
        volume_unit: null,
        pest_target: null,
        control_method: 'biologicalControl',
      };
    },
  },
};

// cleaning_task
const cleaningTaskInitialDataWithProduct = {
  cleaning_target: 'Benches',
  agent_used: true,
  water_usage: 25,
  water_usage_unit: 'l',
  volume: 500,
  volume_unit: 'ml',
};
const cleaningTaskTestCases = {
  nullOptionalFields: {
    initialData: cleaningTaskInitialDataWithProduct,
    getFakeCompletionData: (initialData) => ({
      cleaning_task: {
        task_id: initialData.task_id,
        cleaning_target: null,
        agent_used: false,
        water_usage: null,
        water_usage_unit: 'l', // required by model, cannot be null
        product_id: null,
        product_quantity: null,
        product_quantity_unit: null,
      },
    }),
    getExpectedData: async () => ({
      cleaning_target: null,
      agent_used: false,
      product_id: null,
      water_usage: null,
      water_usage_unit: 'l',
      volume: null,
      volume_unit: null,
    }),
  },
};

// irrigation_task
const getIrrigationTaskNewTypeTestCase = (irrigationTypeName) => {
  return {
    getFakeCompletionData: (initialData) => ({
      irrigation_task: {
        task_id: initialData.task_id,
        irrigation_type_name: irrigationTypeName,
        measuring_type: 'VOLUME',
      },
    }),
    getExpectedData: async () => {
      const { irrigation_type_id } = await knex('irrigation_type')
        .where({ irrigation_type_name: irrigationTypeName })
        .first();

      return {
        irrigation_type_id,
        irrigation_type_name: irrigationTypeName,
      };
    },
  };
};
const irrigationTaskInitialData = {
  irrigation_type_name: 'irrigation type name',
  measuring_type: 'VOLUME',
  estimated_duration: 60,
  estimated_duration_unit: 'minutes',
  estimated_flow_rate: 1.5,
  estimated_flow_rate_unit: 'l/min',
  estimated_water_usage: 90,
  estimated_water_usage_unit: 'l',
};
const irrigationTaskFakeCompletionData = {
  measuring_type: 'DEPTH',
  percent_of_location_irrigated: 3,
  application_depth_unit: 'mm',
  application_depth: 0.002,
  estimated_water_usage: 388.74,
  estimated_water_usage_unit: 'fl-oz',
};
const irrigationTaskTestCases = {
  newIrrigationType: {
    initialData: undefined, // No initial data passed; use factory default
    ...getIrrigationTaskNewTypeTestCase(faker.lorem.word()),
  },
  switchMeasuringType: {
    initialData: irrigationTaskInitialData,
    getFakeCompletionData: (initialData) => ({
      irrigation_task: {
        task_id: initialData.task_id,
        irrigation_type_id: initialData.irrigation_type_id,
        irrigation_type_name: initialData.irrigation_type_name,
        ...irrigationTaskFakeCompletionData,
      },
    }),
    getExpectedData: async () => {
      return {
        ...irrigationTaskFakeCompletionData,
        // The following fields are kept but unused when measuring_type is 'DEPTH'
        estimated_duration: 60,
        estimated_duration_unit: 'minutes',
        estimated_flow_rate: 1.5,
        estimated_flow_rate_unit: 'l/min',
      };
    },
  },
};

// soil_amendment_task
const soilAmendmentTaskInitialData = {
  furrow_hole_depth: 10,
  furrow_hole_depth_unit: 'cm',
};
const soilAmendmentTaskProductFakeCompletionData = {
  weight: null,
  weight_unit: null,
  volume: 3,
  volume_unit: 'l',
  application_rate_weight_unit: null,
  application_rate_volume_unit: 'l/ha',
  total_area_amended: 10321,
  percent_of_location_amended: 50,
};
const soilAmendmentTaskProductInitialDataSetup = async (initialData, farmId) => {
  return setupSoilAmendmentTaskDependencies({
    farmId,
    taskId: initialData.task_id,
    soilAmendmentTaskProductData: {
      weight: 1,
      weight_unit: 'kg',
      application_rate_weight_unit: 'kg/ha',
      percent_of_location_amended: 100,
      total_area_amended: 20642,
    },
  });
};
const soilAmendmentTaskTestCases = {
  nullOptionalFields: {
    initialData: soilAmendmentTaskInitialData,
    getFakeCompletionData: (initialData) => ({
      soil_amendment_task: {
        task_id: initialData.task_id,
        furrow_hole_depth: null,
        furrow_hole_depth_unit: null,
      },
    }),
    getExpectedData: async () => {
      return {
        furrow_hole_depth: null,
        furrow_hole_depth_unit: null,
      };
    },
  },
  switchWeightToVolume: {
    initialData: soilAmendmentTaskInitialData,
    extraSetup: soilAmendmentTaskProductInitialDataSetup,
    getFakeCompletionData: (_initialData, associatedInitialData) => {
      const { soilAmendmentTaskProduct, soilAmendmentTaskProductsPurposeRelationship } =
        associatedInitialData;

      const soilAmendmentProduct = {
        ...soilAmendmentTaskProduct,
        ...soilAmendmentTaskProductFakeCompletionData,
        purpose_relationships: [soilAmendmentTaskProductsPurposeRelationship],
      };

      return { soil_amendment_task_products: [soilAmendmentProduct] };
    },
    extraExpect: async (taskId) => {
      const soilAmendmentTaskProduct = await knex('soil_amendment_task_products')
        .where({ task_id: taskId })
        .first();

      Object.entries(soilAmendmentTaskProductFakeCompletionData).forEach(([property, value]) => {
        expect(soilAmendmentTaskProduct[property]).toBe(value);
      });
    },
  },
};

// soil_sample_task
const soilSampleTaskFakeCompletionData = mocks.fakeSoilSampleTask();
const soilSampleTaskTestCases = {
  updateFields: {
    initialData: undefined,
    getFakeCompletionData: (initialData) => ({
      soil_sample_task: {
        task_id: initialData.task_id,
        ...soilSampleTaskFakeCompletionData,
      },
    }),
    getExpectedData: async () => soilSampleTaskFakeCompletionData,
  },
};

export const taskCompletionFieldUpdateTestCases = {
  'should update relevant fields': {
    irrigation_task: [irrigationTaskTestCases.switchMeasuringType],
    soil_sample_task: [soilSampleTaskTestCases.updateFields],
  },
  'should remove irrelevant fields': {
    cleaning_task: [cleaningTaskTestCases.nullOptionalFields],
    pest_control_task: [pestControlTaskTestCases.changeToMethodWithoutProduct],
    soil_amendment_task: [
      soilAmendmentTaskTestCases.nullOptionalFields,
      soilAmendmentTaskTestCases.switchWeightToVolume,
    ],
  },
  'should add new type on completion': {
    field_work_task: [fieldWorkTaskTestCases.newFieldWorkType],
    irrigation_task: [irrigationTaskTestCases.newIrrigationType],
  },
};

export const taskRecompletionTestCases = {
  irrigation_task: {
    initialData: irrigationTaskInitialData,
    recompletionData: [
      irrigationTaskTestCases.switchMeasuringType,
      getIrrigationTaskNewTypeTestCase(faker.lorem.word()),
    ],
  },
  cleaning_task: {
    initialData: cleaningTaskInitialDataWithProduct,
    recompletionData: [cleaningTaskTestCases.nullOptionalFields],
  },
  pest_control_task: {
    initialData: pestControlTaskInitialDataWithProduct,
    recompletionData: [pestControlTaskTestCases.changeToMethodWithoutProduct],
  },
  soil_amendment_task: {
    initialData: soilAmendmentTaskInitialData,
    extraSetup: soilAmendmentTaskProductInitialDataSetup,
    recompletionData: [
      soilAmendmentTaskTestCases.nullOptionalFields,
      soilAmendmentTaskTestCases.switchWeightToVolume,
    ],
  },
  field_work_task: {
    initialData: undefined,
    recompletionData: [getFieldWorkTaskNewTypeTestCase(faker.lorem.word())],
  },
  soil_sample_task: {
    initialData: undefined,
    recompletionData: [soilSampleTaskTestCases.updateFields],
  },
};
