import React from 'react';
import decorators from '../../config/decorators';
import PureCreateUserAccount from '../../../../components/CreateUserAccount';

export default {
  title: 'Form/Signup/CreateUserAccount',
  decorators: decorators,
  component: PureCreateUserAccount,
};

const Template = (args) => <PureCreateUserAccount {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
