import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/Decorators';
import PureMapHeader from '../../../../components/Map/Header/';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Components/Map/MapHeader',
  component: PureMapHeader,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <PureMapHeader {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  farmName: 'Happy Valley',
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
