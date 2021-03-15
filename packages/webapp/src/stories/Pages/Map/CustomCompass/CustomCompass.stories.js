import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/decorators';
import CustomCompass from '../../../../components/Map/CustomCompass/';

export default {
  title: 'Components/Map/CustomCompass',
  component: CustomCompass,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <CustomCompass {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
