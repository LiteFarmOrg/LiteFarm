import React from 'react';
import PointDetails from '../../components/PointDetails';
import decorator from '../Pages/config/decorators';

export default {
  title: 'Components/Point/PointDetails',
  decorators: decorator,
  component: PointDetails,
};

const Template = (args) => <PointDetails {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'Point Details',
  name: 'Point asset name',
  onBack: (data) => console.log(data),
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
