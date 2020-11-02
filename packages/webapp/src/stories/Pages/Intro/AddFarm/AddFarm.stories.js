import React from 'react';
import decorators from '../../config/decorators';
import AddFarm from "../../../../containers/AddFarm/temp.index";

export default {
  title: 'Form/Intro/2-AddFarm',
  decorators: decorators,
  component: AddFarm,
};

const Template = (args) => <AddFarm {...args} />;

export const Primary = Template.bind({});
Primary.args = {
};
