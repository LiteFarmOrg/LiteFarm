import React from 'react';
import AreaDetails from '../../components/AreaDetails';
import decorator from '../Pages/config/decorators';

export default {
  title: 'Components/Area/AreaDetails',
  decorators: decorator,
  component: AreaDetails,
};

const Template = (args) => <AreaDetails {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  name: 'Area asset name',
  onBack: (data) => console.log(data),
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
