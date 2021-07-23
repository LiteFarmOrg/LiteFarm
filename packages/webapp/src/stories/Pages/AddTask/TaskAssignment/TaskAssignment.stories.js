import React from 'react';
import decorators from '../../config/decorators';
import { chromaticSmallScreen } from '../../config/chromatic';
import PureTaskAssignment from '../../../../components/AddTask/PureTaskAssignment';

export default {
  title: 'Page/AddTask',
  decorators: decorators,
  component: PureTaskAssignment,
};
const userFarmOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Strawberry', value: 'strawberry' },
  { label: 'Kiwi', value: 'kiwi' },
  { label: 'Mango', value: 'mango' },
  { label: 'Banana Apple', value: 'bananaapple' },
];

const oneUser = [{ label: 'Apple', value: 'apple' }];

const Template = (args) => <PureTaskAssignment {...args} />;

export const TaskAssignment = Template.bind({});

TaskAssignment.args = {
  onSubmit: () => console.log('onSave called'),
  handleGoBack: () => console.log('handleGoBack called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  userFarmOptions: userFarmOptions,
};

export const TaskAssignmentDefault = Template.bind({});

TaskAssignmentDefault.args = {
  onSubmit: () => console.log('onSave called'),
  handleGoBack: () => console.log('handleGoBack called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  userFarmOptions: oneUser,
};
