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

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'disabled',
  disabled: true,
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
