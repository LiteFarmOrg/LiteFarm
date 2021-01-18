import React from 'react';
import Card from '../../components/Card';
import { Semibold } from '../../components/Typography';

export default {
  title: 'Components/Card',
  component: Card,
  decorators: [(story) => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <Card {...args} />;
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

export const Active = Template.bind({});
Active.args = {
  color: 'active',
  children: 'Active',
};

export const Disabled = Template.bind({});
Disabled.args = {
  color: 'disabled',
  children: 'Disabled',
};

export const Button = Template.bind({});
Button.args = {
  color: 'secondary',
  children: <Semibold style={{ marginBottom: 0 }}>Secondary</Semibold>,
  isButton: true,
};

export const ButtonActive = Template.bind({});
ButtonActive.args = {
  color: 'active',
  children: <Semibold style={{ marginBottom: 0 }}>Active</Semibold>,
  isButton: true,
};
