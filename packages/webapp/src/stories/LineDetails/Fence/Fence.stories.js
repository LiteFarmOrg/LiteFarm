import React from 'react';
import Fence from '../../../components/LineDetailsLayout/Fence';
import decorator from '../../Pages/config/decorators';

export default {
  title: 'Components/Line/Fence',
  decorators: decorator,
  component: Fence,
};

const Template = (args) => <Fence {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: (data) => {},
  submitForm: (data) => {},
  system: 'metric',
  line_points: (data) => {},
  length: 10,
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
