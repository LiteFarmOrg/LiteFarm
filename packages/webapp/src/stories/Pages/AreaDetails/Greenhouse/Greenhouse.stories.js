import React from 'react';
import Greenhouse from '../../../../components/AreaDetailsLayout/Greenhouse';
import decorator from '../../config/decorators';

export default {
  title: 'Components/Area/Greenhouse',
  decorators: decorator,
  component: Greenhouse,
};

const Template = (args) => <Greenhouse {...args} />;

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
