import React from 'react';
import UpdateTaskDateModal from '../../components/Modals/UpdateTaskDateModal';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/Modals/UpdateTaskDateModal',
  decorators: componentDecorators,
  component: UpdateTaskDateModal,
};

const Template = (args) => <UpdateTaskDateModal {...args} />;

export const Admin = Template.bind({});
Admin.args = {
  due_date: '2022-02-02',
};
