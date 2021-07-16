import React from 'react';
import PureInGroundTransplant from '../../../components/Crop/InGroundTransplant';
import decorators from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/InGroundTransplant',
  decorators: decorators,
  component: PureInGroundTransplant,
};

const Template = (args) => <PureInGroundTransplant {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
  persistedFormData: {},
  history: {},
  variety_id: '1',
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
