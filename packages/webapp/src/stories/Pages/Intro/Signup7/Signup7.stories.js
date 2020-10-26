import React from 'react';
import Signup7 from './Signup7';

export default {
  title: 'Form/Intro/Signup7',
  component: Signup7,
};

const Template = (args) => <Signup7 {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  buttonGroup: (<Signup7/>),
};
