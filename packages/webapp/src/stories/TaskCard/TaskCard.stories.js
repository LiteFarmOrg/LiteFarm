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
  // color: 'taskCurrent',
  status: 'planned',
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
  crops: ['Carrot'],
};

export const Unassigned = Template.bind({});
Unassigned.args = {
  // color: 'taskCurrent',
  status: 'planned',
  locations: [
    {
      farm_id: '1',
      location_id: '1',
      name: 'Location 1',
    },
  ],
  dueDate: '2021-04-20T16:22:41.108Z',
  assignee: null,
  crops: ['Carrot'],
};

export const Late = Template.bind({});
Late.args = {
  status: 'late',
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
  crops: ['Carrot'],
};

export const Completed = Template.bind({});
Completed.args = {
  status: 'completed',
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
  crops: ['Carrot'],
};

export const Abandoned = Template.bind({});
Abandoned.args = {
  status: 'abandoned',
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
  crops: ['Carrot'],
};
