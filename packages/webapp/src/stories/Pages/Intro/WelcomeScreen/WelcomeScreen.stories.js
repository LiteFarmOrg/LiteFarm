import React from 'react';
import decorators from '../../config/decorators';
import WelcomeScreen from '../../../../containers/WelcomeScreen';

export default {
  title: 'Form/Intro/1-WelcomeScreen',
  decorators: decorators,
  component: WelcomeScreen,
};

const Template = (args) => <WelcomeScreen {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
