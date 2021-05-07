import React from 'react';
import Card from '../../components/Card';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Card',
  component: Card,
  decorators: componentDecorators,
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

export const Info = Template.bind({});
Info.args = {
  color: 'info',
  children: 'info',
};

export const Blue = Template.bind({});
Blue.args = {
  color: 'blue',
  children: 'blue',
};

export const BlueActive = Template.bind({});
BlueActive.args = {
  color: 'blueActive',
  children: 'blueActive',
};
