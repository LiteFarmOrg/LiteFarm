import React from 'react';
import NaturalArea from '../../../../components/AreaDetailsLayout/NaturalArea';
import decorator from '../../config/decorators';

export default {
  title: 'Form/Area/NaturalArea',
  decorators: decorator,
  component: NaturalArea,
};

const Template = (args) => <NaturalArea {...args} />;

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
