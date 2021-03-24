import React from 'react';
import NaturalArea from '../../../components/AreaDetailsLayout/NaturalArea';
import decorator from '../../Pages/config/decorators';

export default {
  title: 'Components/Area/NaturalArea',
  decorators: decorator,
  component: NaturalArea,
};

const Template = (args) => <NaturalArea {...args} />;

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
