import React from 'react';
import decorators from '../../config/decorators';
import JoinFarmSuccessScreen from '../../../../components/JoinFarmSuccessScreen';

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
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const Show_spot_light = Template.bind({});
Show_spot_light.args = {
  farm_name: 'Data Farm',
  showSpotLight: true,
};
Show_spot_light.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
