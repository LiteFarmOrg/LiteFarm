import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/Decorators';
import { PureSnackbarWithoutBorder } from '../../../../components/PureSnackbar/';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Components/Map/SuccessHeader',
  component: PureSnackbarWithoutBorder,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <PureSnackbarWithoutBorder {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  closeSuccessHeader: () => {},
  title: 'Farm site boundary successfully saved',
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
