import React from 'react';
import PureTaskCard from '../../components/TaskCard';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/TaskCard',
  component: PureTaskCard,
  decorators: componentDecorators,
};

const Template = (args) => <PureTaskCard {...args} />;
const templateData = {
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
  onClick: null,
  onClickAssignee: (e) => {
    e.stopPropagation();
    console.log('clicked assignee');
  },
  selected: false,
};

export const Planned = Template.bind({});
Planned.args = {
  ...templateData,
};

export const Unassigned = Template.bind({});
Unassigned.args = {
  ...templateData,
  assignee: null,
};

export const Late = Template.bind({});
Late.args = {
  ...templateData,
  status: 'late',
};

export const Completed = Template.bind({});
Completed.args = {
  ...templateData,
  status: 'completed',
};

export const Abandoned = Template.bind({});
Abandoned.args = {
  ...templateData,
  status: 'abandoned',
};

export const ClickableCard = Template.bind({});
ClickableCard.args = {
  ...templateData,
  onClick: () => {
    console.log('clicked card');
  },
};

export const PlannedSelected = Template.bind({});
PlannedSelected.args = {
  ...templateData,
  selected: true,
};

export const LateSelected = Template.bind({});
LateSelected.args = {
  ...templateData,
  status: 'late',
  selected: true,
};

export const CompletedSelected = Template.bind({});
CompletedSelected.args = {
  ...templateData,
  status: 'completed',
  selected: true,
};

export const AbandonedSelected = Template.bind({});
AbandonedSelected.args = {
  ...templateData,
  status: 'abandoned',
  selected: true,
};
