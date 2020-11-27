import React from 'react';
import Input from "../../../components/Form/Input";

export default {
  title: 'Components/Input',
  component: Input,
  decorators: [story => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'default'
};

export const WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
  label: 'With default value',
  defaultValue: 'With default value',
};


export const Optional = Template.bind({});
Optional.args = {
  label: 'optional',
  optional: true
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'disabled'
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  icon: <div style={{position: "absolute", right:0}}>icon</div>,
  label: 'With icon'
};

export const WithError = Template.bind({});
WithError.args = {
  errors: 'error error error error',
  label: 'With error'
};

export const WithInfo = Template.bind({});
WithInfo.args = {
  info: 'info info info info info',
  label: 'With info'
};

export const SearchBar = Template.bind({});
SearchBar.args = {
  placeholder: 'Search',
  isSearchBar: true
};

export const Password = Template.bind({});
Password.args = {
  label: 'Password',
  type: 'password',
};
