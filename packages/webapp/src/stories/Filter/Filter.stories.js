import React from 'react';
import Filter from '../../components/Filter';

export default {
  title: 'Components/Filter',
  component: Filter,
};

const Template = (args) => <Filter {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  subject: 'Status',
  items: [
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
  items: [],
  filterRef: { current: {} },
};
Empty.parameters = {
  chromatic: { disable: true },
};
