import React from 'react';
import Signup2 from './Signup2';

export default {
  title: 'Form/Intro/Signup2',
  component: Signup2,
};

const Template = (args) => <Signup2 {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  buttonGroup: (<Signup2/>),
};
