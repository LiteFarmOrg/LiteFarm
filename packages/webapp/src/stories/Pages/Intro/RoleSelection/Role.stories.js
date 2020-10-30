import React from 'react';
import RoleSelection from "../../../../containers/RoleSelection";
import decorators from '../../config/decorators';

export default {
  title: 'Form/Intro/RoleSelection',
  decorators: decorators,
  component: RoleSelection,
};

const Template = (args) => <RoleSelection {...args} />;

export const Primary = Template.bind({});
Primary.args = {

};
