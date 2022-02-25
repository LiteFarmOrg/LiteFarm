import React from 'react';
import PureTransplant from '../../../components/Crop/Transplant';
import decorators from '../config/Decorators';

export default {
  title: 'Form/ManagementPlan/Transplant',
  component: PureTransplant,
  decorators: decorators,
};

const Template = (args) => <PureTransplant {...args} />;

export const CanNotBeCoverCrop = Template.bind({});
CanNotBeCoverCrop.args = {
  persistedFormData: {
    crop_management_plan: { needs_transplant: true },
  },
  useHookFormPersist: () => ({}),
  onSubmit: (data) => {
    console.log(data);
  },
  onGoBack: () => {},
  onCancel: () => {},
  can_be_cover_crop: false,
};

export const CoverCrop = Template.bind({});
CoverCrop.args = {
  persistedFormData: {
    crop_management_plan: { needs_transplant: false, for_cover: false },
  },
  can_be_cover_crop: true,
  useHookFormPersist: () => ({}),
  onSubmit: (data) => {
    console.log(data);
  },
  onGoBack: () => {},
  onCancel: () => {},
};
