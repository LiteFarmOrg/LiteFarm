import React from 'react';
import DropdownButton from '../../components/Form/DropDownButton';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/DropdownButton',
  component: DropdownButton,
  decorators: componentDecorators,
};

const Template = (args) => <DropdownButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  options: [{ text: 'option1' }, { text: 'option2' }, { text: 'option3' }],
  children: 'Dropdown',
};
