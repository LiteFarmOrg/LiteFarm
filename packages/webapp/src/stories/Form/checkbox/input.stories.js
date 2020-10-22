import React from 'react';
import Input from './';

export default {
  title: 'Components/Checkbox',
  component: Input,
};

const Template = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {

};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  children: <div style={{position: "absolute", right:0}}>icon</div>,
};

export const CheckBox = Template.bind({});
CheckBox.args = {
};
