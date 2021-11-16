import React from 'react';
import PurePlanGuidance from '../../../components/Crop/BedPlan/PurePlanGuidance';
import decorators from '../config/decorators';

export default {
  title: 'Form/ManagementPlan/PlanGuidance',
  component: PurePlanGuidance,
  decorators: decorators,
};

const Template = (args) => <PurePlanGuidance {...args} />;

export const HistoricalBeds = Template.bind({});
HistoricalBeds.args = {
  system: 'metric',
  useHookFormPersist: () => {},
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        initial: { bed_method: { bed_spacing: 10 } },
      },
    },
  },
  isFinalPage: false,
  isBed: true,
};

export const FinalRows = Template.bind({});
FinalRows.args = {
  system: 'metric',
  useHookFormPersist: () => {},
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        final: { row_method: { row_spacing: 10 } },
      },
    },
  },
  isFinalPage: true,
  isBed: false,
};
