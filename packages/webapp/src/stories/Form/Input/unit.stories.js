import React from 'react';
import Input from '../../../components/Form/Unit';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/Unit',
  component: Input,
  decorators: componentDecorators,
};

const Template = (args) => {
  return <Input {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  label: 'default',
  from: 'km',
  defaultValue: '1000',
  system: 'metric',
};
