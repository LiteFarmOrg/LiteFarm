import React from 'react';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';
import { PureTaskTypeSelection } from '../../../components/Task/PureTaskTypeSelection/PureTaskTypeSelection';

export default {
  title: 'Page/Task/PureTaskTypeSelection',
  decorators: decorators,
  component: PureTaskTypeSelection,
};
const taskTypes = [
  {
    task_type_id: 1,
    task_name: 'Bed Preparation',
    task_translation_key: 'BED_PREPARATION_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 3,
    task_name: 'Sales',
    task_translation_key: 'SALE_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 7,
    task_name: 'Scouting',
    task_translation_key: 'SCOUTING_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 8,
    task_name: 'Harvesting',
    task_translation_key: 'HARVEST_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 10,
    task_name: 'Wash and Pack',
    task_translation_key: 'WASH_AND_PACK_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 11,
    task_name: 'Pest Control',
    task_translation_key: 'PEST_CONTROL_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 12,
    task_name: 'Other',
    task_translation_key: 'OTHER_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 68,
    task_name: 'Break',
    task_translation_key: 'BREAK_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 89,
    task_name: 'Soil Sample Results',
    task_translation_key: 'SOIL_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 90,
    task_name: 'Irrigation',
    task_translation_key: 'IRRIGATION_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 2,
    task_name: 'Transport',
    task_translation_key: 'TRANSPORT_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 9,
    task_name: 'Field Work',
    task_translation_key: 'FIELD_WORK_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 4,
    task_name: 'Social',
    task_translation_key: 'SOCIAL_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 91,
    task_name: 'Cleaning',
    task_translation_key: 'CLEANING_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 6,
    task_name: 'Soil Amendment',
    task_translation_key: 'SOIL_AMENDMENT_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 5,
    task_name: 'Planting',
    task_translation_key: 'PLANT_TASK',
    farm_id: null,
    deleted: false,
  },
  {
    task_type_id: 92,
    task_name: 'Transplant',
    task_translation_key: 'TRANSPLANT_TASK',
    farm_id: null,
    deleted: false,
  },
];
const customTasks = [
  {
    task_type_id: 93,
    task_name: 'custom 1',
    task_translation_key: 'custom 1',
    farm_id: '71d84984-88cc-11eb-84e5-0a7facd3678d',
    deleted: false,
  },
  {
    task_type_id: 94,
    task_name: 'custom 2',
    task_translation_key: 'custom 2',
    farm_id: '71d84984-88cc-11eb-84e5-0a7facd3678d',
    deleted: false,
  },
];
const Template = (args) => <PureTaskTypeSelection {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
  persistedFormData: {},
  taskTypes,
  customTasks,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
