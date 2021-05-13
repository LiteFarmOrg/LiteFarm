import React from 'react';
import decorators from '../../config/decorators';
import PureInviteSignup from '../../../../components/InviteSignup';
import Button from '../../../../components/Form/Button';

export default {
  title: 'Page/PureInviteSignUpScreen',
  decorators: decorators,
  component: PureInviteSignup,
};

const Template = (args) => <PureInviteSignup {...args} />;

export const WithoutError = Template.bind({});
WithoutError.args = {
  googleButton: <Button fullLength>Proceed</Button>,
  showError: false,
  selectedKey: 0,
  email: 'example@litefarm.org',
};
WithoutError.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const SelectGoogle = Template.bind({});
SelectGoogle.args = {
  googleButton: <Button fullLength>Proceed</Button>,
  showError: false,
  selectedKey: 1,
  email: 'example@litefarm.org',
};
SelectGoogle.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const WithError = Template.bind({});
WithError.args = {
  googleButton: <Button fullLength>Proceed</Button>,
  showError: true,
  selectedKey: 1,
  email: 'example@litefarm.org',
};
SelectGoogle.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const WithErrorAndIsNotChrome = Template.bind({});
WithErrorAndIsNotChrome.args = {
  googleButton: <Button fullLength>Proceed</Button>,
  showError: true,
  selectedKey: 1,
  email: 'example@litefarm.org',
  isChrome: false,
};
WithErrorAndIsNotChrome.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const isNotChrome = Template.bind({});
isNotChrome.args = {
  googleButton: <Button fullLength>Proceed</Button>,
  selectedKey: 1,
  email: 'example@litefarm.org',
  isChrome: false,
};
isNotChrome.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
