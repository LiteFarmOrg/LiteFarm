import React from 'react';
import PureManagementTasks from '../../../components/Crop/ManagementDetail/ManagementPlanTasks';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/ManagementTasks',
  decorators: decorators,
  component: PureManagementTasks,
};

const Template = (args) => <PureManagementTasks {...args} />;

export const IsAdmin = Template.bind({});
IsAdmin.args = {
  onBack: () => {},
  onCompleted: () => {},
  variety: {
    crop_translation_key: 'Crop',
    crop_variety_name: 'Variety',
    crop_variety_photo_url: '',
    supplier: 'Supplier',
  },
  plan: {
    name: 'name',
    notes: 'notes',
  },
  isAdmin: true,
  match: { params: { variety_id: 'variety_id', management_plan_id: 'management_plan_id' } },
  history: { location: { pathname: '/crop/variety_id/management_plan/management_plan_id/tasks' } },
};
IsAdmin.parameters = {
  ...chromaticSmallScreen,
};

export const IsNotAdmin = Template.bind({});
IsNotAdmin.args = {
  onBack: () => {},
  onCompleted: () => {},
  variety: {
    crop_translation_key: 'Crop',
    crop_variety_name: 'Variety',
    crop_variety_photo_url: '',
    supplier: 'Supplier',
  },
  plan: {
    name: 'name',
    notes: 'notes',
  },
  isAdmin: false,
  match: { params: { variety_id: 'variety_id', management_plan_id: 'management_plan_id' } },
  history: { location: { pathname: '/crop/variety_id/management_plan/management_plan_id/tasks' } },
};
IsNotAdmin.parameters = {
  ...chromaticSmallScreen,
};

export const Completed = Template.bind({});
Completed.args = {
  onBack: () => {},
  onCompleted: () => {},
  variety: {
    crop_translation_key: 'Crop',
    crop_variety_name: 'Variety',
    crop_variety_photo_url: '',
    supplier: 'Supplier',
  },
  plan: {
    name: 'name',
    notes: 'notes',
    complete_date: '2020-01-01',
  },
  isAdmin: true,
  match: { params: { variety_id: 'variety_id', management_plan_id: 'management_plan_id' } },
  history: { location: { pathname: '/crop/variety_id/management_plan/management_plan_id/tasks' } },
};
Completed.parameters = {
  ...chromaticSmallScreen,
};

export const Abandoned = Template.bind({});
Abandoned.args = {
  onBack: () => {},
  onCompleted: () => {},
  variety: {
    crop_translation_key: 'Crop',
    crop_variety_name: 'Variety',
    crop_variety_photo_url: '',
    supplier: 'Supplier',
  },
  plan: {
    name: 'name',
    notes: 'notes',
    abandon_date: '2020-01-01',
  },
  isAdmin: true,
  match: { params: { variety_id: 'variety_id', management_plan_id: 'management_plan_id' } },
  history: { location: { pathname: '/crop/variety_id/management_plan/management_plan_id/tasks' } },
};
Abandoned.parameters = {
  ...chromaticSmallScreen,
};
