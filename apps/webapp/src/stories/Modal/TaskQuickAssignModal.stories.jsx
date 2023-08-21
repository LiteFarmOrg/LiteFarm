import React from 'react';
import TaskQuickAssignModal from '../../components/Modals/QuickAssignModal';
import { componentDecorators } from '../Pages/config/Decorators';

const props = {
  task_id: 2333,
  due_date: 'Oct 7, 2021',
  isAssigned: true,
  users: [
    {
      user_id: '104942873090979111002',
      first_name: 'litefarm',
      last_name: 'dev',
    },
    {
      user_id: '104942873090979111001',
      first_name: 'litefarm1',
      last_name: 'dev',
    },
    {
      user_id: '104942873090979111000',
      first_name: 'litefarm2',
      last_name: 'dev',
    },
    {
      user_id: '104942873090979111005',
      first_name: 'litefarm3',
      last_name: 'dev',
    },
    {
      user_id: '104942873090979111006',
      first_name: 'litefarm4',
      last_name: 'dev',
    },
    {
      user_id: '104942873090979111007',
      first_name: 'litefarm5',
      last_name: 'dev',
    },
  ],
  user: {
    is_admin: true,
    user_id: '104942873090979111002',
    first_name: 'litefarm',
    last_name: 'dev',
  },
};

export default {
  title: 'Components/Modals/TaskQuickAssignModal',
  decorators: componentDecorators,
  component: TaskQuickAssignModal,
};

const Template = (args) => <TaskQuickAssignModal {...args} />;

export const Admin = Template.bind({});
Admin.args = props;

export const Worker = Template.bind({});
Worker.args = {
  ...props,
  user: { ...props.user, is_admin: false },
};
