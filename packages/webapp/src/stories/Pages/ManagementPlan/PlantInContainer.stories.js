import React from 'react';
import PurePlantInContainer from '../../../components/PlantInContainer';
import decorators from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/PurePlantInContainer',
  decorators: decorators,
  component: PurePlantInContainer,
};

const Template = (args) => <PurePlantInContainer {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  system: 'metric',
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
