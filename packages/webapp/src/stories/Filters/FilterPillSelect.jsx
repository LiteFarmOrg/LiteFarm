import React from 'react';
import FilterPillSelect from '../../components/Filter/FilterPillSelect';

export default {
  title: 'Components/Filters/FilterPillSelect',
  component: FilterPillSelect,
};

const Template = (args) => <FilterPillSelect {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  subject: 'Status',
  options: [
    {
      value: 'active',
      label: 'Active',
    },
    {
      value: 'planned',
      label: 'Planned',
    },
    {
      value: 'complete',
      label: 'Complete',
    },
    {
      value: 'abandoned',
      label: 'Abandoned',
    },
    {
      value: 'needs_plan',
      label: 'Needs plan',
    },
  ],
  filterRef: { current: {} },
};
Primary.parameters = {
  chromatic: { disable: true },
};

export const Empty = Template.bind({});
Empty.args = {
  subject: 'Status',
  options: [],
  filterRef: { current: {} },
};
Empty.parameters = {
  chromatic: { disable: true },
};
