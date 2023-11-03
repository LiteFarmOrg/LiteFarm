import React from 'react';
import { componentDecorators } from '../Pages/config/Decorators';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';

export default {
  title: 'Components/PureSearchbarAndFilter',
  component: PureSearchbarAndFilter,
  decorators: componentDecorators,
};

const Template = (args) => <PureSearchbarAndFilter {...args} />;

export const WithInactiveFilter = Template.bind({});
WithInactiveFilter.args = {
  isFilterActive: false,
};

export const WithActiveFilter = Template.bind({});
WithActiveFilter.args = {
  isFilterActive: true,
};

export const WithoutFilter = Template.bind({});
WithoutFilter.args = {
  disableFilter: true,
};

export const WithCustomPlaceholder = Template.bind({});
WithCustomPlaceholder.args = {
  placeholderText: 'Search expense types',
};
