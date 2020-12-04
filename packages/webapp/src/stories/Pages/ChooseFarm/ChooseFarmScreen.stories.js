import React from 'react';
import decorators from '../config/decorators';
import ChooseFarm from '../../../containers/ChooseFarm/';

export default {
  title: 'Page/ChooseFarm',
  decorators: decorators,
  component: ChooseFarm,
};

const Template = (args) => <ChooseFarm {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
