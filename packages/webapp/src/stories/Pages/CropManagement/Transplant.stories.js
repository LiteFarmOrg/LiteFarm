import React from 'react';
import Transplant from '../../../components/Crop/transplant';
import decorators from '../config/decorators';

export default {
  title: 'Page/AddManagementPlan/Transplant',
  component: Transplant,
  decorators: decorators,
};

const Template = (args) => <Transplant {...args} />;

export const Default = Template.bind({});
Default.args = {
  persistedFormData: {},
  useHookFormPersist: () => {},
  onSubmit: (data) => {
    console.log(data);
  },
  onGoBack: () => {},
  onCancel: () => {},
};

export const CoverCrop = Template.bind({});
CoverCrop.args = {
  persistedFormData: {
    for_cover: false,
  },
  isCoverCrop: true,
  useHookFormPersist: () => {},
  onSubmit: (data) => {
    console.log(data);
  },
  onGoBack: () => {},
  onCancel: () => {},
};
