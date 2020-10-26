import React from 'react';
import Signup3 from './Signup3';

export default {
  title: 'Form/Intro/Signup3',
  component: Signup3,
};

const Template = (args) => <Signup3 {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  buttonGroup: (<Signup3/>),
};
