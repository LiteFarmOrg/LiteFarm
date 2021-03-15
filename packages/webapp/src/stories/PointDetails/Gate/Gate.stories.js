import React from 'react';
import Gate from '../../../components/PointDetailsLayout/Gate';
import decorator from '../../Pages/config/decorators';

export default {
  title: 'Components/Point/Gate',
  decorators: decorator,
  component: Gate,
};

const Template = (args) => <Gate {...args} />;

export const Primary = Template.bind({});
Primary.args = { pointType: (data) => {} };
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
