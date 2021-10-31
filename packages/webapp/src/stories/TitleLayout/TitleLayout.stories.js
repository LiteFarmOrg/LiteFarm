import React from 'react';
import TitleLayout from '../../components/Layout/TitleLayout';
import decorator from '../Pages/config/decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Layout/TitleLayout',
  decorators: decorator,
  component: TitleLayout,
};

const Template = (args) => <TitleLayout {...args} />;

export const Primary = Template.bind({});
Primary.args = { title: 'Dummy header' };
Primary.parameters = {
  ...chromaticSmallScreen,
};
