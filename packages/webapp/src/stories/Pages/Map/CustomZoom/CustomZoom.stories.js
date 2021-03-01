import React from 'react';
import decorators, { componentDecoratorsWithoutPadding } from '../../config/decorators';
import CustomZoom from '../../../../components/Map/CustomZoom/';

export default {
  title: 'Components/Map/CustomZoom',
  component: CustomZoom,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <CustomZoom {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
