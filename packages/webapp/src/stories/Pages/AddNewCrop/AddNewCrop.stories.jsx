import React from 'react';
import PureAddNewCrop from '../../../components/AddNewCrop';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';
import ImagePickerWrapper from '../../../containers/ImagePickerWrapper';
import { AddLink } from '../../../components/Typography';

const imageUploader = (
  <ImagePickerWrapper>
    <AddLink>{'Add Image'}</AddLink>
  </ImagePickerWrapper>
);

export default {
  title: 'Form/Crop/AddNewCrop',
  decorators: decorators,
  component: PureAddNewCrop,
};

const Template = (args) => <PureAddNewCrop {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
  handleGoBack: () => {},
  handleCancel: () => {},
  imageUploader,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const WithDropdownOpen = Template.bind({});
WithDropdownOpen.args = {
  useHookFormPersist: () => ({}),
  isPhysiologyAnatomyDropDownOpen: true,
  handleGoBack: () => {},
  handleCancel: () => {},
  imageUploader,
};
WithDropdownOpen.parameters = {
  ...chromaticSmallScreen,
};
