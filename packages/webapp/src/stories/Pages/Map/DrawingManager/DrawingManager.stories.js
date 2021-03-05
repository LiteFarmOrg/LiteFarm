import React from 'react';
import decorators, { componentDecoratorsWithoutPadding } from '../../config/decorators';
import DrawingManager from '../../../../components/Map/DrawingManager/';

export default {
  title: 'Components/Map/DrawingManager',
  component: DrawingManager,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <DrawingManager {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
