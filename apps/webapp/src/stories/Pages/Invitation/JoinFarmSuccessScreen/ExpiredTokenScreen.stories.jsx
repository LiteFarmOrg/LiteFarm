import React from 'react';
import decorators from '../../config/Decorators';
import JoinFarmSuccessScreen from '../../../../components/JoinFarmSuccessScreen';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Page/JoinFarmSuccessScreen',
  decorators: decorators,
  component: JoinFarmSuccessScreen,
};

const Template = (args) => <JoinFarmSuccessScreen {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  farm_name: 'Data Farm',
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const Show_spot_light = Template.bind({});
Show_spot_light.args = {
  farm_name: 'Data Farm',
  showSpotLight: true,
};
Show_spot_light.parameters = {
  ...chromaticSmallScreen,
};
