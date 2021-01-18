import React from 'react';
import { authenticatedDecorators } from '../../config/decorators';
import PureInvitedUserCreateAccountPage from '../../../../components/InvitedUserCreateAccount';

export default {
  title: 'Form/PureInvitedUserCreateAccountPage',
  decorators: authenticatedDecorators,
  component: PureInvitedUserCreateAccountPage,
};

const Template = (args) => <PureInvitedUserCreateAccountPage {...args} />;

export const notSSO = Template.bind({});
notSSO.args = {
  onSubmit: (data) => console.log(data),
  email: 'example@gmail.com',
  name: 'liteFarm',
  title: 'Create your account',
  buttonText: 'Create New Account',
  isNotSSO: true,
};

export const SSO = Template.bind({});
SSO.args = {
  onSubmit: (data) => console.log(data),
  email: 'example@gmail.com',
  name: 'liteFarm',
  title: 'Your information',
  buttonText: 'Save',
};

export const notSSOWithTooltipOpen = Template.bind({});
notSSOWithTooltipOpen.args = {
  onSubmit: (data) => console.log(data),
  email: 'example@gmail.com',
  name: 'liteFarm',
  title: 'Create your account',
  buttonText: 'Create New Account',
  isNotSSO: true,
  autoOpen: true,
};
