import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';

export default {
  title: 'Components/PureSearchbarAndFilter',
  component: PureSearchbarAndFilter,
  decorators: componentDecorators,
};

const Template = (args) => <PureSearchbarAndFilter {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  color: 'primary',
  children: 'Primary',
};
