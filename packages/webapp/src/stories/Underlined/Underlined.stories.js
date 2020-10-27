import React from 'react';
import Underlined from './';

export default {
  title: 'Components/Underlined',
  component: Underlined,
  decorators: [story => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <Underlined {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Primary',
};