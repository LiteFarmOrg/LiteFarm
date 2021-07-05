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
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  onContinue: () => {},
  system: 'metric',
  variety: {
    average_seed_weight: 1,
    yield_per_plant: 2
  },
  persistedFormData: {},
  persistPath: [],
};

Primary.parameters = {
  ...chromaticSmallScreen,
};