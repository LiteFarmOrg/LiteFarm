import React from 'react';
import FarmSiteBoundary from '../../../../components/AreaDetailsLayout/FarmSiteBoundary';
import decorator from '../../config/decorators';

export default {
  title: 'Form/Area/FarmSiteBoundary',
  decorators: decorator,
  component: FarmSiteBoundary,
};

const Template = (args) => <FarmSiteBoundary {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: (data) => {},
  submitForm: (data) => {},
  areaType: (data) => {},
  system: 'metric',
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
