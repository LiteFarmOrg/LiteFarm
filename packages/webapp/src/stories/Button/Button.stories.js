import React from 'react';
import styles from './button.scss';
import Button from './';

export default {
  title: 'Components/Button',
  component: Button,
  decorators: [story => <div style={{ padding: '3rem' }}>{story()}</div>],
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
  color: 'primary',
  label: 'Button',
  disabled: true
};

export const InjectSecondary = Template.bind({});
InjectSecondary.args = {
  color: 'primary',
  label: 'Button',
  classes: {btn: styles.secondary}
};