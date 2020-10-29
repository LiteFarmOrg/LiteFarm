import React from 'react';
import PureOutroSplash from '../../components/Outro';
import decorators from '../Pages/config/decorators';

export default {
  title: 'Form/Intro/Outro',
  decorators: decorators,
  component: PureOutroSplash,
};

const Template = (args) => <PureOutroSplash {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  redirectFinish: () => {}
};
