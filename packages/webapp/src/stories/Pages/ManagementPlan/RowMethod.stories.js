import React from 'react';
import PureRowMethod from '../../../components/Crop/RowMethod';
import decorators from '../config/decorators';
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
  variety: { average_seed_weight: 10, yield_per_plant: 10 },
  useHookFormPersist: () => {},
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
