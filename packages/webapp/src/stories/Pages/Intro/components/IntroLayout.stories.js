import React from 'react';
import Layout from './Layout';
import Button from '../../../Button';
import Svg from './Svg';
import signup2 from '../../../assets/signUp/signUp2.svg';
import decorators from './decorators';

export default {
  title: 'Layout/Intro',
  decorators: decorators,
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
  children: <Svg svg={signup2} alt={'Welcome to LiteFarm'}/>,
  isSVG: true,
};

export const TwoButton = Template.bind({});
TwoButton.args = {
  buttonGroup: (<><Button fullLength/><Button fullLength/></>),
};