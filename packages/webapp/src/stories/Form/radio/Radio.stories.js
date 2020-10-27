import React from 'react';
import Radio from './';

export default {
  title: 'Components/Radio',
  component: Radio,
  decorators: [story => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <Radio {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "checkbox"
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: "disabled",
  disabled: true,
};