import React from 'react';
import PureRowMethod from '../../../components/Crop/RowMethod';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/RowMethod',
  decorators: decorators,
  component: PureRowMethod,
};

const Template = (args) => <PureRowMethod {...args} />;

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

export const HistoricalInitial = Template.bind({});
HistoricalInitial.args = {
  history: {},
  system: 'metric',
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      needs_transplant: true,
      planting_management_plans: {
        final: {},
      },
    },
  },
  isFinalPage: false,
};
HistoricalInitial.parameters = {
  ...chromaticSmallScreen,
};

export const HistoricalFinal = Template.bind({});
HistoricalFinal.args = {
  history: {},
  system: 'metric',
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      needs_transplant: false,
      planting_management_plans: {
        final: {},
      },
    },
  },
  isFinalPage: true,
};
HistoricalFinal.parameters = {
  ...chromaticSmallScreen,
};

export const FinalSameLength = Template.bind({});
FinalSameLength.args = {
  history: {},
  system: 'metric',
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        final: {
          row_method: {
            same_length: true,
            number_of_rows: 10,
            row_length: 10,
            plant_spacing: 10,
          },
        },
      },
    },
  },
  isFinalPage: true,
};
FinalSameLength.parameters = {
  ...chromaticSmallScreen,
};

export const InitialDifferentLength = Template.bind({});
InitialDifferentLength.args = {
  history: {},
  system: 'metric',
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        initial: {
          row_method: {
            same_length: false,
            total_rows_length: 10,
            plant_spacing: 10,
          },
        },
      },
    },
  },
  isFinalPage: false,
};
InitialDifferentLength.parameters = {
  ...chromaticSmallScreen,
};
