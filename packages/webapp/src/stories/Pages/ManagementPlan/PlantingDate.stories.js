import React from 'react';
import PurePlantingDate from '../../../components/Crop/PlantingDate';
import decorators from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';
import { getDateInputFormat } from '../../../components/LocationDetailLayout/utils';

export default {
  title: 'Form/ManagementPlan/PlantingDate',
  decorators: decorators,
  component: PurePlantingDate,
};

const Template = (args) => <PurePlantingDate {...args} />;

export const Transplant = Template.bind({});
Transplant.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  persistedFormData: {
    for_cover: false,
    needs_transplant: true,
    seed_date: getDateInputFormat(new Date()),
  },
  onSubmit: (data) => console.log(data),
};
Transplant.parameters = {
  ...chromaticSmallScreen,
};

export const CoverCrop = Template.bind({});
CoverCrop.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  persistedFormData: {
    for_cover: true,
    needs_transplant: false,
    seed_date: getDateInputFormat(new Date()),
  },
  onSubmit: (data) => console.log(data),
};
CoverCrop.parameters = {
  ...chromaticSmallScreen,
};
