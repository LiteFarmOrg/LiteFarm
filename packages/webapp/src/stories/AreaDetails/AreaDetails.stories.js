import React from 'react';
import AreaDetailsLayout from '../../components/AreaDetailsLayout';
import decorator from '../Pages/config/decorators';

export default {
  title: 'Components/Area/AreaDetailsLayout',
  decorators: decorator,
  component: AreaDetailsLayout,
};

const Template = (args) => <AreaDetailsLayout {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  name: 'Area asset name',
  title: 'Area asset title',
  submitForm: (data) => console.log(data),
  onError: (data) => console.log(data),
  isNameRequired: true,
  disabled: false,
  register: (data) => console.log(data),
  handleSubmit: (data) => console.log(data),
  showPerimeter: true,
  setValue: (data) => console.log(data),
  history: (data) => console.log(data),
  errors: (data) => console.log(data),
  areaType: (data) => console.log(data),
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
