import React from 'react';
import InputAutoSize from '../../../components/Form/InputAutoSize';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/InputAutoSize',
  component: InputAutoSize,
  decorators: componentDecorators,
};

const Template = (args) => <InputAutoSize {...args} />;

export const Optional = Template.bind({});
Optional.args = {
  label: 'Optional',
  defaultValue: 'default value',
  rowsMax: 4,
  optional: true,
};

export const Empty = Template.bind({});
Empty.args = {
  label: 'Notes',
  rowsMax: 4,
  optional: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'disabled',
  rowsMax: 4,
  optional: true,
  disabled: true,
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Notes',
  defaultValue: 'default value',
  rowsMax: 4,
  errors: 'error',
  disabled: false,
};
