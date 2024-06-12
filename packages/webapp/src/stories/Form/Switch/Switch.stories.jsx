import React from 'react';
import Switch from '../../../components/Form/Switch';
import { componentDecorators } from '../../Pages/config/Decorators';

export default {
  title: 'Components/Switch',
  component: Switch,
  decorators: componentDecorators,
};

const Template = (args) => <Switch {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const Checked = Template.bind({});
Checked.args = {
  checked: true,
};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: 'Switch',
};

export const WithLeftLabel = Template.bind({});
WithLeftLabel.args = {
  leftLabel: 'Switch',
};

export const ToggleVariant = Template.bind({});
ToggleVariant.args = {
  leftLabel: 'Left',
  label: 'Right',
  isToggleVariant: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  leftLabel: 'Left',
  label: 'Right',
  isToggleVariant: true,
  disabled: true,
};
