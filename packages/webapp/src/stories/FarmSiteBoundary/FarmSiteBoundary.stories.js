import React from 'react';
import FarmSiteBoundary from '../../components/FarmSiteBoundary';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Area/FarmSiteBoundary',
  decorators: componentDecorators,
  component: FarmSiteBoundary,
};

const Template = (args) => <FarmSiteBoundary {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
