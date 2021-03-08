import React from 'react';
import AreaDetails from '../../components/AreaDetails';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Area/AreaDetails',
  decorators: componentDecorators,
  component: AreaDetails,
};

const Template = (args) => <AreaDetails {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'Area Details',
  onBack: (data) => console.log(data),
  name: 'Area asset name',
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
