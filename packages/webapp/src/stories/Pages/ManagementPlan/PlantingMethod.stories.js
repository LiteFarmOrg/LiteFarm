import React from 'react';
import PurePlantingMethod from '../../../components/PlantingMethod';
import decorators from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/PlantingMethod',
  decorators: decorators,
  component: PurePlantingMethod,
};

const Template = (args) => <PurePlantingMethod {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  persistedFormData: {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const Container = Template.bind({});
Container.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  persistedFormData: { in_ground: false, planting_depth: 0.99 },
};
Container.parameters = {
  ...chromaticSmallScreen,
};

export const InGround = Template.bind({});
InGround.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  persistedFormData: { in_ground: true, plant_spacing: 1 },
};
InGround.parameters = {
  ...chromaticSmallScreen,
};
