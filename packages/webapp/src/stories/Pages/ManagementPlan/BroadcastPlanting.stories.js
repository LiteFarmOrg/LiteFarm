import React from 'react';
import PureBroadcastPlan from '../../../components/Crop/BroadcastPlan';
import decorators from '../config/decorators';
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
  useHookFormPersist: () => {},
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
  useHookFormPersist: () => {},
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

export const Historical = Template.bind({});
Historical.args = {
  variety_id: 'variety_id',
  useHookFormPersist: () => {},
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        initial: {
          broadcast_method: {
            percentage_planted: 10,
            seeding_rate: 3,
          },
        },
      },
    },
  },
  system: 'metric',
  locationSize: 2000,
  yieldPerArea: 30,
  isFinalPage: false,
};

Historical.parameters = {
  ...chromaticSmallScreen,
};
