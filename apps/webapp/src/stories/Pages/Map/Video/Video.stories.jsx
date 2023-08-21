import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/Decorators';
import PureVideo from '../../../../components/Map/Videos/index';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Components/Map/Videos',
  component: PureVideo,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <PureVideo {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
