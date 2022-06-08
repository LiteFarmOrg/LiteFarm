import React from 'react';
import InputDuration from '../../../components/Form/InputDuration';
import { componentDecorators } from '../../Pages/config/Decorators';
import { useForm } from 'react-hook-form';

export default {
  title: 'Components/InputDuration',
  component: InputDuration,
  decorators: componentDecorators,
};

const Template = (args) => {
  const { register, watch } = useForm({ mode: 'onChange' });
  return <InputDuration {...args} hookFormWatch={watch} hookFormRegister={register('duration')} />;
};

export const Default = Template.bind({});
Default.args = {
  label: 'default',
  startDate: '5-26-2021',
};
