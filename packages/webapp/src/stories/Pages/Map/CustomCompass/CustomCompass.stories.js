import React from 'react';
import decorators, { componentDecoratorsWithoutPadding } from '../../config/decorators';
import CustomCompass from '../../../../components/Map/CustomCompass/';

export default {
  title: 'Components/Map/CustomCompass',
  component: CustomCompass,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <CustomCompass {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
