import React from 'react';
import NativeDatePickerWrapper from '../../components/Form/NativeDatePicker/NativeDatePickerWrapper';
import { componentDecorators } from '../Pages/config/decorators';
import { Underlined } from '../../components/Typography';

export default {
  title: 'Components/NativeDatePickerWrapper',
  component: NativeDatePickerWrapper,
  decorators: componentDecorators,
};

const Template = (args) => <NativeDatePickerWrapper {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  children: <Underlined>Pick a date</Underlined>,
};
