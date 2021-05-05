import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import PageBreak from '../../components/PageBreak';

export default {
  title: 'Components/PageBreak',
  component: PageBreak,
  decorators: componentDecorators,
};

const Template = (args) => <PageBreak {...args} />;
export const Default = Template.bind({});
Default.args = {};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: 'label',
};
