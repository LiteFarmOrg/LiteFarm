import React from 'react';
import { FilterDateRange } from '../../components/Filter/FilterDateRange';

export default {
  title: 'Components/FilterDateRange',
  component: FilterDateRange,
};

const Template = (args) => <FilterDateRange {...args} />;

export const Default = Template.bind({});
Default.args = {
  subject: 'Filter by date range',
};

export const WithFromToDate = Template.bind({});
WithFromToDate.args = {
  defaultFromDate: '2022-02-01',
  defaultToDate: '2022-02-10',
  subject: 'Filter by date range',
};
export const WithFromDate = Template.bind({});
WithFromDate.args = {
  defaultFromDate: '2022-02-01',
  subject: 'Filter by date range',
};
export const WithToDate = Template.bind({});
WithToDate.args = {
  defaultToDate: '2022-02-10',
  subject: 'Filter by date range',
};
