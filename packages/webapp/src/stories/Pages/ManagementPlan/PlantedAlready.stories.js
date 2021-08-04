import React from 'react';
import PurePlantedAlready from '../../../components/Crop/PlantedAlready';
import decorators from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/PlantedAlready',
  component: PurePlantedAlready,
  decorators: decorators,
};

const Template = (args) => <PurePlantedAlready {...args} />;

export const Seedling = Template.bind({});

Seedling.args = {
  persistedFormData: {
    crop_management_plan: {
      seed_date: '2021-07-21',
      already_in_ground: false,
      is_seed: false,
    },
  },
  useHookFormPersist: () => {},
  onSubmit: (data) => {
    console.log(data);
  },
  onGoBack: () => {},
  onCancel: () => {},
  system: 'metric',
};
Seedling.parameters = {
  ...chromaticSmallScreen,
};

export const WildCrop = Template.bind({});
WildCrop.args = {
  persistedFormData: {
    crop_management_plan: {
      seed_date: '2021-07-20',
      already_in_ground: true,
      is_wild: true,
    },
  },
  useHookFormPersist: () => {},
  onSubmit: (data) => {
    console.log(data);
  },
  onGoBack: () => {},
  onCancel: () => {},
  system: 'imperial',
};
WildCrop.parameters = {
  ...chromaticSmallScreen,
};
