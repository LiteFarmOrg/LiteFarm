import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import { ManagementPlanCard } from '../../components/CardWithStatus/ManagementPlanCard/ManagementPlanCard';

export default {
  title: 'Components/ManagementPlanCard',
  component: ManagementPlanCard,
  decorators: componentDecorators,
};

const multiRowNotes = 'multi row, '.repeat(100);

const Template = (args) => <ManagementPlanCard {...args} />;
export const Active = Template.bind({});
Active.args = {
  managementPlanName: 'Management Plan',
  locationName: 'Field 1',
  notes: 'Row 1',
  startDate: '01-01-2021',
  endDate: '01-02-2021',
  numberOfPendingTask: 0,
  status: 'active',
};

export const Planned = Template.bind({});
Planned.args = {
  managementPlanName: 'Management Plan',
  locationName: 'Field 1',
  notes: 'Bed 1',
  startDate: '01-01-2021',
  endDate: '01-01-2021',
  numberOfPendingTask: 1,
  status: 'planned',
};

export const Abandoned = Template.bind({});
Abandoned.args = {
  managementPlanName: 'Management Plan',
  locationName: 'Field 1',
  notes: multiRowNotes,
  startDate: '01-01-2021',
  endDate: '01-02-2021',
  numberOfPendingTask: 1234567,
  score: 1,
  status: 'abandoned',
};

export const Completed = Template.bind({});
Completed.args = {
  managementPlanName: 'Management Plan',
  locationName: 'Field 1',
  startDate: '01-01-2021',
  endDate: '01-02-2021',
  numberOfPendingTask: 3,
  score: 4,
  status: 'completed',
};
