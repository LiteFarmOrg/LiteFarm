import React from 'react';
import InputAutoSize from '../../../components/Form/InputAutoSize';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/InputAutoSize',
  component: InputAutoSize,
  decorators: componentDecorators,
};

const Template = (args) => <InputAutoSize {...args} />;

export const WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
  label: 'default value',
  defaultValue: 'default value',
  rowsMax: 4,
};

export const Optional = Template.bind({});
Optional.args = {
  label: 'optional',
  rowsMax: 4,
  optional: true,
};

export const Primary = Template.bind({});
Primary.args = {
  label: 'primary',
  rowsMax: 4,
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'disabled',
  rowsMax: 4,
  disabled: true,
  defaultValue: 'disabled',
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'error',
  rowsMax: 4,
  errors: 'error',
};

export const MultiRow = Template.bind({});
MultiRow.args = {
  label: 'multi row',
  rowsMax: 4,
  defaultValue: 'multi row, '.repeat(100),
};
