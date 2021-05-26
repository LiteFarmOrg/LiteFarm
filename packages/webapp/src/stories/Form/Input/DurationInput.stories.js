import React from 'react';
import InputDuration from '../../../components/Form/InputDuration';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/InputDuration',
  component: InputDuration,
  decorators: componentDecorators,
};

const Template = (args) => <InputDuration {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'default',
  date: 'May 2, 2021',
};
