import React from 'react';
import Input from '../../../components/Form/Input';
import { Underlined } from '../../../components/Typography';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/Input',
  component: Input,
  decorators: componentDecorators,
};

const Template = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'default',
};

export const Number = Template.bind({});
Number.args = {
  label: 'number',
  type: 'number',
};

export const WithUnit = Template.bind({});
WithUnit.args = {
  label: 'number',
  type: 'number',
  unit: 'unit',
};

export const WithCurrency = Template.bind({});
WithCurrency.args = {
  label: 'number',
  type: 'number',
  currency: '$',
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  label: 'With Tooltip',
  toolTipContent:
    'Gender information is collected for research purposes only and will only be shared with  personally identifying information removed',
};

export const WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
  label: 'With default value',
  defaultValue: 'With default value',
};

export const Optional = Template.bind({});
Optional.args = {
  label: 'optional',
  optional: true,
};

export const HasLeaf = Template.bind({});
HasLeaf.args = {
  label: 'Leaf',
  hasLeaf: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'disabled',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  icon: <div style={{ position: 'absolute', right: 0 }}>icon</div>,
  label: 'With icon',
};

export const WithError = Template.bind({});
WithError.args = {
  errors: 'error error error error',
  label: 'With error',
};

export const WithInfo = Template.bind({});
WithInfo.args = {
  info: 'info info info info info',
  label: 'With info',
};

export const SearchBar = Template.bind({});
SearchBar.args = {
  placeholder: 'Search',
  isSearchBar: true,
};

export const Password = Template.bind({});
Password.args = {
  label: 'Password',
  type: 'password',
};

export const PasswordWithLink = Template.bind({});
PasswordWithLink.args = {
  label: 'Password',
  type: 'password',
  icon: <Underlined>Forget password</Underlined>,
};
