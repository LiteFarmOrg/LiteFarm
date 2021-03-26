import React from 'react';
import WaterValve from '../../../components/PointDetailsLayout/WaterValve';
import decorator from '../../Pages/config/decorators';

export default {
  title: 'Form/Point/WaterValve',
  decorators: decorator,
  component: WaterValve,
};

const Template = (args) => <WaterValve {...args} />;

export const Primary = Template.bind({});
Primary.args = { system: 'metric' };
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
