import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import PageBreak from '../../components/PageBreak';
import Square from '../../components/Square';

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

export const WithLabelAndChildren = Template.bind({});
WithLabelAndChildren.args = {
  label: 'Active',
  children: <Square>8</Square>,
};
