import React from 'react';
import SurfaceWater from '../../../../components/AreaDetailsLayout/SurfaceWater';
import decorator from '../../config/decorators';

export default {
  title: 'Components/Area/SurfaceWater',
  decorators: decorator,
  component: SurfaceWater,
};

const Template = (args) => <SurfaceWater {...args} />;

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
