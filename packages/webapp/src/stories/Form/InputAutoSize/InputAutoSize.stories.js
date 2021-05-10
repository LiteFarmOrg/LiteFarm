import React from 'react';
import InputAutoSize from '../../../components/Form/InputAutoSize';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/InputAutoSize',
  component: InputAutoSize,
  decorators: componentDecorators,
};

const Template = (args) => <InputAutoSize {...args} />;


export const Primary = Template.bind({});
Primary.args = {
  label: 'Notes',
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

export const withError = Template.bind({});
withError.args = {
  label: 'Notes',
  defaultValue: 'default value',
  rowsMax: 4,
  optional: true,
  errors: 'error',
  disabled: false,

}