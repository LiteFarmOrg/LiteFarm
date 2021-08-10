import React from 'react';
import TaskQuickAssignModal from '../../components/Task/QuickAssign';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Modals/TaskQuickAssignModal',
  decorators: componentDecorators,
  component: TaskQuickAssignModal,
};

const Template = () => <TaskQuickAssignModal />;

export const Primary = Template.bind({});
