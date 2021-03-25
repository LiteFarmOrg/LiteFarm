import React from 'react';
import Residence from '../../../../components/AreaDetailsLayout/Residence';
import decorator from '../../config/decorators';

export default {
  title: 'Form/Area/Residence',
  decorators: decorator,
  component: Residence,
};

const Template = (args) => <Residence {...args} />;

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
