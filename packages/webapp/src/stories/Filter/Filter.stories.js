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
  items: ['Active', 'Planned', 'Complete', 'Abandoned', 'Needs Plan'],
};
