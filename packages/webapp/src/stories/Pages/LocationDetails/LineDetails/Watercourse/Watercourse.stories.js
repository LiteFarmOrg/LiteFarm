import React from 'react';
import Watercourse from '../../../../../components/LocationDetailLayout/LineDetails/Watercourse';
import decorator from '../../../config/decorators';

export default {
  title: 'Form/Location/Line/Watercourse',
  decorators: decorator,
  component: Watercourse,
};

const Template = (args) => <Watercourse {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
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
Post.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
