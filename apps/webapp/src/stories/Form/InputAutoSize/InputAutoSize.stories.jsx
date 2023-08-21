import React from 'react';
import InputAutoSize from '../../../components/Form/InputAutoSize';
import { componentDecorators } from '../../Pages/config/Decorators';

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
  maxRows: 4,
};

export const Optional = Template.bind({});
Optional.args = {
  label: 'optional',
  maxRows: 4,
  optional: true,
};

export const Primary = Template.bind({});
Primary.args = {
  label: 'primary',
  maxRows: 4,
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'disabled',
  maxRows: 4,
  disabled: true,
  defaultValue: 'disabled',
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'error',
  maxRows: 4,
  errors: 'error',
};

export const MultiRow = Template.bind({});
MultiRow.args = {
  label: 'multi row',
  maxRows: 4,
  defaultValue: 'multi row, '.repeat(100),
};
