import React from 'react';
import styles from '../../components/Form/Button/button.scss';
import Button from "../../components/Form/Button";

export default {
  title: 'Components/Button',
  component: Button,
  decorators: [story => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  color: 'primary',
  children: 'Primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  children: 'Secondary',
};

export const Disabled = Template.bind({});
Disabled.args = {
  color: 'primary',
  children: 'Disabled',
  disabled: true
};

export const InjectSecondary = Template.bind({});
InjectSecondary.args = {
  color: 'primary',
  label: 'Button',
  classes: {btn: styles.secondary}
};
