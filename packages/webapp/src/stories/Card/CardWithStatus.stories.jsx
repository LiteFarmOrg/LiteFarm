import React from 'react';
import { componentDecorators } from '../Pages/config/Decorators';
import { CardWithStatus } from '../../components/CardWithStatus';

export default {
  title: 'Components/CardWithStatus',
  component: CardWithStatus,
  decorators: componentDecorators,
};

const Template = (args) => <CardWithStatus classes={{ card: { height: '100px' } }} {...args} />;
export const TaskForReview = Template.bind({});
TaskForReview.args = {
  color: 'secondary',
  children: 'For review',
  status: 'active',
  label: 'For Review',
  style: { height: '100px' },
};

export const TaskForReviewActive = Template.bind({});
TaskForReviewActive.args = {
  color: 'active',
  children: 'For review selected',
  status: 'active',
  label: 'For Review',
};

export const TaskPlanned = Template.bind({});
TaskPlanned.args = {
  color: 'secondary',
  children: 'planned',
  status: 'planned',
  label: 'Planned',
};

export const TaskPlannedActive = Template.bind({});
TaskPlannedActive.args = {
  color: 'active',
  children: 'planned active',
  status: 'planned',
  label: 'Planned',
};

export const TaskLate = Template.bind({});
TaskLate.args = {
  color: 'secondary',
  children: 'late',
  status: 'late',
  label: 'Late',
};

export const TaskLateActive = Template.bind({});
TaskLateActive.args = {
  color: 'active',
  children: 'late active',
  status: 'late',
  label: 'Late',
};

export const TaskCompleted = Template.bind({});
TaskCompleted.args = {
  color: 'completed',
  children: 'completed',
  status: 'completed',
  label: 'Completed',
  score: 0,
};

export const TaskCompletedActive = Template.bind({});
TaskCompletedActive.args = {
  color: 'completedActive',
  children: 'completed',
  status: 'completed',
  label: 'Completed',
  score: 1,
};

export const TaskAbandoned = Template.bind({});
TaskAbandoned.args = {
  color: 'completed',
  children: 'completed',
  status: 'abandoned',
  label: 'Abandoned',
};

export const TaskAbandonedActive = Template.bind({});
TaskAbandonedActive.args = {
  color: 'completedActive',
  children: 'completed',
  status: 'abandoned',
  label: 'Abandoned',
};

export const TaskDisabled = Template.bind({});
TaskDisabled.args = {
  color: 'disabled',
  children: 'Disabled',
  status: 'disabled',
  label: 'Disabled',
};
