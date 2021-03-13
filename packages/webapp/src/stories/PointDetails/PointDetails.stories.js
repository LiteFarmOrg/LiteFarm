import React from 'react';
import PointDetails from '../../components/PointDetailsLayout';
import decorator from '../Pages/config/decorators';

export default {
  title: 'Components/Point/PointDetails',
  decorators: decorator,
  component: PointDetails,
};

const Template = (args) => <PointDetails {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  name: 'Point asset name',
  onBack: (data) => console.log(data),
  handleSubmit: (data) => console.log(data),
  register: (data) => console.log(data),
  title: 'Point details title',
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
