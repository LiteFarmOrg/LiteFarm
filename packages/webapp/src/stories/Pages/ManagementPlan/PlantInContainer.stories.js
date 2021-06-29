import React from 'react';
import PurePlantInContainer from '../../../components/Crop/PlantInContainer';
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
  persistedFormData: {},
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const Container = Template.bind({});
Container.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  system: 'metric',
  persistedFormData: { in_ground: false, planting_depth: 0.99 },
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },
};
Container.parameters = {
  ...chromaticSmallScreen,
};

export const InGround = Template.bind({});
InGround.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  system: 'metric',
  persistedFormData: { in_ground: true, plant_spacing: 1 },
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },
};
InGround.parameters = {
  ...chromaticSmallScreen,
};
