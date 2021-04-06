import React from 'react';
import Fence from '../../../../../components/LocationDetailLayout/LineDetailsLayout/Fence';
import decorator from '../../../config/decorators';

export default {
  title: 'Form/Location/Line/Fence',
  decorators: decorator,
  component: Fence,
};

const Template = (args) => <Fence {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
  history: (data) => {},
  submitForm: (data) => {},
  system: 'metric',
  line_points: (data) => {},
  length: 10,
};
Post.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
