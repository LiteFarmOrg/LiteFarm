import React from 'react';
import decorators from '../../config/decorators';
import AddFarm from "../../../../containers/AddFarm";
import { HomeRain } from '../../Home/PureHome.stories';

export default {
  title: 'Form/Intro/2-AddFarm',
  decorators: decorators,
  component: AddFarm,
};

const Template = (args) => <AddFarm {...args} />;

export const Primary = Template.bind({});
Primary.args = {
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};