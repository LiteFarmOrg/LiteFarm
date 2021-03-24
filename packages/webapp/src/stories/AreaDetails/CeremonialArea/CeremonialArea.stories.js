import React from 'react';
import CeremonialArea from '../../../components/AreaDetailsLayout/CeremonialArea';
import decorator from '../../Pages/config/decorators';

export default {
  title: 'Components/Area/CeremonialArea',
  decorators: decorator,
  component: CeremonialArea,
};

const Template = (args) => <CeremonialArea {...args} />;

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
