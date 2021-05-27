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
  persistedFormData: { planting_type: 'CONTAINER' },
};
Container.parameters = {
  ...chromaticSmallScreen,
};

export const Beds = Template.bind({});
Beds.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  persistedFormData: { planting_type: 'BEDS' },
};
Beds.parameters = {
  ...chromaticSmallScreen,
};

export const Rows = Template.bind({});
Rows.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  persistedFormData: { planting_type: 'ROWS' },
};
Rows.parameters = {
  ...chromaticSmallScreen,
};

export const Broadcast = Template.bind({});
Broadcast.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  persistedFormData: { planting_type: 'BROADCAST' },
};
Broadcast.parameters = {
  ...chromaticSmallScreen,
};
