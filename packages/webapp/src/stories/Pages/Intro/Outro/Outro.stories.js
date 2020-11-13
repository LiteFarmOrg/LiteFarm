import React from 'react';
import PureOutroSplash from '../../../../components/Outro';
import decorators from '../../config/decorators';

export default {
  title: 'Form/Intro/6-Outro',
  decorators: decorators,
  component: PureOutroSplash,
};

const Template = (args) => <PureOutroSplash {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  redirectFinish: () => {}
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};