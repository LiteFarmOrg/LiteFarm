import React from 'react';
import PureBedPlan from '../../../components/Crop/BedPlan/PureBedPlan';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/BedPlan',
  component: PureBedPlan,
  decorators: decorators,
};

const Template = (args) => <PureBedPlan {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: {},
  system: 'metric',
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        final: {},
      },
    },
  },
  isFinalPage: true,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const Final = Template.bind({});
Final.args = {
  history: {},
  system: 'metric',
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        final: {
          bed_method: {
            number_of_beds: 10,
            number_of_rows_in_bed: 10,
            bed_length: 10,
            plant_spacing: 10,
          },
        },
      },
    },
  },
  isFinalPage: true,
};
Final.parameters = {
  ...chromaticSmallScreen,
};

export const Historical = Template.bind({});
Historical.args = {
  history: {},
  system: 'metric',
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        initial: {
          bed_method: {
            number_of_beds: 10,
            number_of_rows_in_bed: 10,
            bed_length: 10,
            plant_spacing: 10,
          },
        },
      },
    },
  },
  isFinalPage: false,
};
Historical.parameters = {
  ...chromaticSmallScreen,
};
