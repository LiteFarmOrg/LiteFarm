import React from 'react';
import PureBroadcastPlan from '../../../components/Crop/BroadcastPlan';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/BroadcastPlan',
  component: PureBroadcastPlan,
  decorators: decorators,
};

const Template = (args) => <PureBroadcastPlan {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  variety_id: 'variety_id',
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        initial: {
          broadcast_method: {},
        },
      },
    },
  },
  system: 'metric',
  locationSize: 2000,
  yieldPerArea: 30,
  isFinalPage: true,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const Final = Template.bind({});
Final.args = {
  variety_id: 'variety_id',
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        final: {
          broadcast_method: {
            percentage_planted: 10,
            seeding_rate: 2,
          },
        },
      },
    },
  },
  system: 'metric',
  locationSize: 2000,
  yieldPerArea: 30,
  isFinalPage: true,
};
Final.parameters = {
  ...chromaticSmallScreen,
};

export const HistoricalInitial = Template.bind({});
HistoricalInitial.args = {
  variety_id: 'variety_id',
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      needs_transplant: true,
    },
  },
  system: 'metric',
  locationSize: 2000,
  yieldPerArea: 30,
  isFinalPage: false,
};

HistoricalInitial.parameters = {
  ...chromaticSmallScreen,
};

export const HistoricalFinal = Template.bind({});
HistoricalFinal.args = {
  variety_id: 'variety_id',
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      already_in_ground: true,
      needs_transplant: false,
    },
  },
  system: 'metric',
  locationSize: 2000,
  yieldPerArea: 30,
  isFinalPage: true,
};

HistoricalFinal.parameters = {
  ...chromaticSmallScreen,
};
