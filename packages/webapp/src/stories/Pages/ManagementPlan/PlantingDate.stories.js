import React from 'react';
import PurePlantingDate from '../../../components/PlantingDate';
import decorators from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/PlantingDate',
  decorators: decorators,
  component: PurePlantingDate,
};

const Template = (args) => <PurePlantingDate {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
