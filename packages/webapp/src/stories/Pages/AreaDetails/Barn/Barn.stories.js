import React from 'react';
import Barn from '../../../../components/AreaDetailsLayout/Barn';
import decorator from '../../config/decorators';

export default {
  title: 'Form/Area/Barn',
  decorators: decorator,
  component: Barn,
};

const Template = (args) => <Barn {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: (data) => {},
  submitForm: (data) => {},
  system: 'metric',
  grid_points: (data) => {},
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
