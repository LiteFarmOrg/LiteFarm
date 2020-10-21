import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1

import { Button } from './';

export default {
  title: 'Components/Button',
  component: Button,
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  color: 'primary',
  label: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  label: 'Button',
};

export const Disabled = Template.bind({});
Disabled.args = {
  size: 'large',
  label: 'Button',
  disabled: true
};
