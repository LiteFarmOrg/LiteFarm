import React from 'react';
import ActiveFilterBox from '../../components/ActiveFilterBox';

export default {
  title: 'Components/ActiveFilterBox',
  component: ActiveFilterBox,
};

const Template = (args) => <ActiveFilterBox {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  activeFilters: [
    {
      filterKey: 'STATUS',
      value: 'active',
      label: 'Active',
    },
    {
      filterKey: 'LOCATION',
      value: 'buckerfields id',
      label: 'Buckerfields',
    },
    {
      filterKey: 'LOCATION',
      value: 'field 3 id',
      label: 'Field 3',
    },
    {
      filterKey: 'LOCATION',
      value: 'field 4 id',
      label: 'Field 4',
    },
    {
      filterKey: 'LOCATION',
      value: 'field 5 id',
      label: 'Field 5',
    },
    {
      filterKey: 'LOCATION',
      value: 'Greenhouse 1 id',
      label: 'Greenhouse 1',
    },
    {
      filterKey: 'STATUS',
      value: 'needs_plan',
      label: 'Needs Plan',
    },
    {
      filterKey: 'LOCATION',
      value: 'veggie garden id',
      label: 'Veggie Garden',
    },
  ],
};
Primary.parameters = {
  chromatic: { disable: true },
};
