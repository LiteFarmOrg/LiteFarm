import React from 'react';
import FarmSiteBoundary from '../../../components/AreaDetailsLayout/FarmSiteBoundary';
import decorator from '../../Pages/config/decorators';

export default {
  title: 'Components/Area/FarmSiteBoundary',
  decorators: decorator,
  component: FarmSiteBoundary,
};

const Template = (args) => <FarmSiteBoundary {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: (data) => {},
  submitForm: (data) => {},
  system: (data) => {},
  grid_points: (data) => {},
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
