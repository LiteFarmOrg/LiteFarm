import React from 'react';
import Checkbox from '../../../components/Form/Checkbox';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
  decorators: componentDecorators,
};

const Template = (args) => <Checkbox {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'checkbox',
};

export const Checked = Template.bind({});
Checked.args = {
  label: 'checkbox',
  checked: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'disabled',
  disabled: true,
};

export const CheckedAndDisabled = Template.bind({});
CheckedAndDisabled.args = {
  label: 'disabled',
  disabled: true,
  checked: true,
};

export const WithError = Template.bind({});
WithError.args = {
  errors: 'error error error error',
};

const classes = {
  checkbox: { backgroundColor: 'yellow' },
  label: { fontSize: '50px' },
  container: { marginLeft: '100px' },
};

export const WithClasses = Template.bind({});
WithClasses.args = {
  errors: 'error error error error',
  classes: classes,
};
