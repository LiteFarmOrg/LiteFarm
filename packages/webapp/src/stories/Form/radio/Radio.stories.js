import React from 'react';
import Radio from '../../../components/Form/Radio';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/Radio',
  component: Radio,
  decorators: componentDecorators,
};

const Template = (args) => <Radio {...args} />;

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
