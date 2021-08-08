import React from 'react';
import PureTaskCard from '../../components/TaskCard';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/TaskCard',
  component: PureTaskCard,
  decorators: componentDecorators,
};

const Template = (args) => <PureTaskCard {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  color: 'primary',
  locations: [
    {
      farm_id: '1',
      location_id: '1',
      name: 'Location 1',
    },
  ],
  dueDate: '2021-04-20T16:22:41.108Z',
  assignee: {
    first_name: 'First',
    last_name: 'Last',
  },
};

export const Unassigned = Template.bind({});
Unassigned.args = {
  color: 'primary',
  locations: [
    {
      farm_id: '1',
      location_id: '1',
      name: 'Location 1',
    },
  ],
  dueDate: '2021-04-20T16:22:41.108Z',
  assignee: null,
};
