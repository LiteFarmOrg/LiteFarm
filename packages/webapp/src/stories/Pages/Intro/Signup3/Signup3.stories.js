import React from 'react';
import Signup3 from './Signup3';
import decorators from '../../config/decorators';

export default {
  title: 'Form/Intro/Signup3',
  decorators: decorators,
  component: Signup3,
};

const Template = (args) => <Signup3 {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  // buttonGroup: (<Signup3/>),
};
