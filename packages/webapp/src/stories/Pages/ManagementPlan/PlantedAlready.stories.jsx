import React from 'react';
import PurePlantedAlready from '../../../components/Crop/PlantedAlready';
import decorators from '../config/Decorators';
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
  useHookFormPersist: () => ({}),
  system: 'metric',
  cropVariety: {
    needs_transplant: true,
    can_be_cover_crop: true,
    crop_variety_id: 'crop_variety_id',
  },
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
  useHookFormPersist: () => ({}),
  system: 'imperial',
  cropVariety: {
    needs_transplant: false,
    can_be_cover_crop: false,
    crop_variety_id: 'crop_variety_id',
  },
};
WildCrop.parameters = {
  ...chromaticSmallScreen,
};
