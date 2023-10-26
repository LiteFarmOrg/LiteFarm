import React from 'react';
import FloatingActionButton from '../../components/Button/FloatingActionButton';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/FloatingActionButton',
  component: FloatingActionButton,
  decorators: componentDecorators,
};

const Template = (args) => <FloatingActionButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
