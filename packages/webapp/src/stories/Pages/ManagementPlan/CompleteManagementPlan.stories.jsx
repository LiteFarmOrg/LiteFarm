import React from 'react';
import { PureCompleteManagementPlan } from '../../../components/Crop/CompleteManamgenentPlan/PureCompleteManagementPlan';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/PureCompleteManagementPlan',
  decorators: decorators,
  component: PureCompleteManagementPlan,
};

const Template = (args) => <PureCompleteManagementPlan {...args} />;

export const Complete = Template.bind({});
Complete.args = {
  crop_variety: {
    crop_translation_key: 'Blueberry',
    crop_variety_name: 'Blueberry 1',
    supplier: 'supplier',
    crop_variety_photo_url:
      'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp',
  },
  onSubmit: (data) => console.log(data),
  start_date: '2021-08-01',
};
Complete.parameters = {
  ...chromaticSmallScreen,
};

export const Abandon = Template.bind({});
Abandon.args = {
  crop_variety: {
    crop_translation_key: 'Blueberry',
    crop_variety_name: 'Blueberry 1',
    supplier: 'supplier',
    crop_variety_photo_url:
      'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp',
  },
  isAbandonPage: true,
  onSubmit: (data) => console.log(data),
  reasonOptions: [
    { label: 'reason1', value: 'reason1' },
    { label: 'reason1', value: 'reason2' },
  ],
};
Abandon.parameters = {
  ...chromaticSmallScreen,
};
