import React from 'react';
import Layout from './';
import Button from '../../Button';
import WelcomeSVG from './Signup2';
export default {
  title: 'Layout/Intro',
  component: Layout,
};

const Template = (args) => <Layout {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  buttonGroup: (<Button fullLength/>),
};

export const SVG = Template.bind({});
SVG.args = {
  buttonGroup: (<Button fullLength/>),
  children: <WelcomeSVG/>,
  isSVG: true,
};

export const TwoButton = Template.bind({});
TwoButton.args = {
  buttonGroup: (<><Button fullLength/><Button fullLength/></>),
};