import React from 'react';
import Footer from './';
import Button from '../Button';

export default {
  title: 'Components/Footer',
  component: Footer,
};

const Template = (args) => <Footer {...args} />;

export const OneButton = Template.bind({});
OneButton.args = {
  children: (<Button fullLength/>)
};

export const TwoButtons = Template.bind({});
TwoButtons.args = {
  children: (<><Button fullLength/><Button fullLength/></>)
};