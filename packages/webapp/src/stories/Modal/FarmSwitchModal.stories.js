import React from 'react';
import { componentDecoratorsGreyBackground } from '../Pages/config/decorators';
import FarmSwitchPureOutroSplash from '../../components/FarmSwitchOutro';

export default {
  title: 'Components/Modals/FarmSwitchModal',
  decorators: componentDecoratorsGreyBackground,
  component: FarmSwitchPureOutroSplash,
};

const Template = (args) => <FarmSwitchPureOutroSplash {...args} />;

export const Primary = Template.bind({});
Primary.args = { farm_name: 'liteFarm' };
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
