import React from 'react';
import { PureTaskCard } from '../../components/CardWithStatus/TaskCard/TaskCard';
import { componentDecorators } from '../Pages/config/Decorators';
import { getTaskCardDate } from '../../util/moment';

export default {
  title: 'Components/TaskCard',
  component: PureTaskCard,
  decorators: componentDecorators,
};

const Template = (args) => <PureTaskCard {...args} />;
const templateData = {
  taskType: {
    task_name: 'Transport',
    task_translation_key: 'TRANSPORT_TASK',
  },
  status: 'planned',
  locationName: 'Location 1',
  completeOrDueDate: getTaskCardDate('2021-04-20T16:22:41.108Z'),
  assignee: {
    first_name: 'First',
    last_name: 'Last',
  },
  cropVarietyName: 'Carrot',
  onClick: null,
  onClickAssignee: (e) => {
    e.stopPropagation();
    console.log('clicked assignee');
  },
  selected: false,
  happiness: null,
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

export const CompletedWithRating = Template.bind({});
CompletedWithRating.args = {
  ...templateData,
  status: 'completed',
  happiness: 4,
};

export const Abandoned = Template.bind({});
Abandoned.args = {
  ...templateData,
  status: 'abandoned',
  abandonDate: '2023-04-12T00:00:00.000',
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

export const CompletedSelectedWithSadRating = Template.bind({});
CompletedSelectedWithSadRating.args = {
  ...templateData,
  status: 'completed',
  selected: true,
  happiness: 0,
};

export const AbandonedSelected = Template.bind({});
AbandonedSelected.args = {
  ...templateData,
  status: 'abandoned',
  selected: true,
  abandonDate: '2023-04-12T00:00:00.000',
};
