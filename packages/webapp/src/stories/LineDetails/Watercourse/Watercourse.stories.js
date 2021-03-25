import React from 'react';
import Watercourse from '../../../components/LineDetailsLayout/Watercourse';
import decorator from '../../Pages/config/decorators';

export default {
  title: 'Components/Line/Watercourse',
  decorators: decorator,
  component: Watercourse,
};

const Template = (args) => <Watercourse {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: (data) => {},
  submitForm: (data) => {},
  system: (data) => {},
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
