import React from 'react';
import ProgressBar from '../../components/ProgressBar';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  decorators: componentDecorators,
};

const Template = (args) => <ProgressBar {...args} />;

export const One_third = Template.bind({});
One_third.args = {
  label: 'progress',
  value: 33,
};

export const Two_third = Template.bind({});
Two_third.args = {
  label: 'progress',
  value: 66,
};

export const Full = Template.bind({});
Full.args = {
  label: 'progress',
  value: 100,
};
