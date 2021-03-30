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
  system: 'metric',
  width: 10,
  width_display: 10,
  buffer_width: 12,
  buffer_width_display: 12,
  length: 3,
  line_points: (data) => {},
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
