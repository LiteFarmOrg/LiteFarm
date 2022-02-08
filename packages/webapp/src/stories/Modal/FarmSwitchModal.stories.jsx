import React from 'react';
import { componentDecoratorsGreyBackground } from '../Pages/config/Decorators';
import FarmSwitchPureOutroSplash from '../../components/FarmSwitchOutro';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/FarmSwitchModal',
  decorators: componentDecoratorsGreyBackground,
  component: FarmSwitchPureOutroSplash,
};

const Template = (args) => <FarmSwitchPureOutroSplash {...args} />;

export const Primary = Template.bind({});
Primary.args = { farm_name: 'liteFarm' };
Primary.parameters = {
  ...chromaticSmallScreen,
};
