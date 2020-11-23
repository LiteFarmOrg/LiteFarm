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
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};