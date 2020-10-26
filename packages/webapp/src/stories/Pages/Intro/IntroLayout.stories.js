import React from 'react';
import Layout from './Layout';
import Button from '../../Button';
import Svg from './Svg';
import TwoInputWithTitle from './TwoInputWithTitle';
import signup2 from '../../assets/signUp/signUp2.svg';

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
  children: <Svg svg={signup2} alt={'Welcome to LiteFarm'}/>,
  isSVG: true,
};

export const TwoButton = Template.bind({});
TwoButton.args = {
  buttonGroup: (<><Button fullLength/><Button fullLength/></>),
};

export const AddFarm = Template.bind({});
AddFarm.args = {
  buttonGroup: (<Button fullLength/>),
  children: <TwoInputWithTitle title={'Tell us about your farm'} label0={'Farm name'} label1={'Farm location'}
                               info1={'Street address or comma separated latitude and longitude (e.g. 49.250945, -123.238492)'}
  icon1={'icon'}
  />,
  isForm: true,
};