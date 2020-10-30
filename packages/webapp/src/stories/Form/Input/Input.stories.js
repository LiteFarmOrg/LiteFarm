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

};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  icon: <div style={{position: "absolute", right:0}}>icon</div>,
};

