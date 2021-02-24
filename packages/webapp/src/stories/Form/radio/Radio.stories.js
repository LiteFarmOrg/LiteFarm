import React from 'react';
import Radio from '../../../components/Form/Radio';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/Radio',
  component: Radio,
  decorators: componentDecorators,
};

const Template = (args) => <Radio {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'checkbox',
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'disabled',
  disabled: true,
};
