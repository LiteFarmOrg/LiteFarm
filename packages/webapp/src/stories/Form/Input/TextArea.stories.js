import React from 'react';
import TextArea from '../../../components/Form/TextArea';
import { componentDecorators } from '../../Pages/config/decorators';

export default {
  title: 'Components/Input/TextArea',
  component: TextArea,
  decorators: componentDecorators,
};

const Template = (args) => <TextArea {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'default',
};
