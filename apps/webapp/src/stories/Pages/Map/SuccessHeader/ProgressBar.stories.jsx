import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/Decorators';
import ProgressBar from '../../../../components/Map/ProgressBar';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Components/Map/ProgressBar',
  component: ProgressBar,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <ProgressBar {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  closeSuccessHeader: () => {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
