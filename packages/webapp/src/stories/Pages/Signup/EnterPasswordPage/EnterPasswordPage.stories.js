import React from 'react';
import decorators from '../../config/decorators';
import EnterPasswordPage from "../../../../components/Signup/EnterPasswordPage";

export default {
  title: 'Form/Signup/EnterPassword',
  decorators: decorators,
  component: EnterPasswordPage,
};

const Template = (args) => <EnterPasswordPage {...args} />;

export const Primary = Template.bind({});
Primary.args = {
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};