import React from 'react';
import Toolkit from './';
import Underlined from '../Underlined';
export default {
  title: 'Components/OverlayTooltip',
  component: Toolkit,
  decorators: [story => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <Toolkit {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: <Underlined>Why are we asking this?</Underlined>,
  content: "LiteFarm generates forms required for organic certification. Some information will be mandatory."
};
