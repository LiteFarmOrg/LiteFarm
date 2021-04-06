import React from 'react';
import BufferZone from '../../../../../components/LocationDetailLayout/LineDetailsLayout/BufferZone';
import decorator from '../../../config/decorators';

export default {
  title: 'Form/Location/Line/BufferZone',
  decorators: decorator,
  component: BufferZone,
};

const Template = (args) => <BufferZone {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
  history: (data) => {},
  submitForm: (data) => {},
  system: (data) => {},
};
Post.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
