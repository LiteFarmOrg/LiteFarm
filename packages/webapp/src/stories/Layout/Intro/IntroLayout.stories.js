import React from 'react';
import Layout from './';
import Button from '../../Button';

export default {
  title: 'Layout/Intro',
  component: Layout,
};

const Template = (args) => <Layout {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  buttonGroup: (<Button style={{width: "100%"}}/>),
};
