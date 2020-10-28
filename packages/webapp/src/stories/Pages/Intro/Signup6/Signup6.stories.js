import React from 'react';
import Signup6 from './Signup6';
import decorators from '../components/decorators';

export default {
  title: 'Form/Intro/Signup6',
  decorators: decorators,
  component: Signup6,
};

const Template = (args) => <Signup6 {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  // buttonGroup: (<Signup6/>),
};
