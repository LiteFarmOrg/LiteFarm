import React from 'react';
import BufferZone from '../../../components/LineDetailsLayout/BufferZone';
import decorator from '../../Pages/config/decorators';

export default {
  title: 'Components/Line/BufferZone',
  decorators: decorator,
  component: BufferZone,
};

const Template = (args) => <BufferZone {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: (data) => {},
  submitForm: (data) => {},
  system: (data) => {},
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
