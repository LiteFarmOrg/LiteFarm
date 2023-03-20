import React from 'react';
import decorators from '../../config/Decorators';
import PureTaskAssignment from '../../../../components/Task/PureTaskAssignment';

export default {
  title: 'Page/Task/AddTask',
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

const moreThanEightUsers = [
  { label: 'Coconut', value: 'coconut' },
  { label: 'Blueberry', value: 'blueberry' },
  { label: 'Orange', value: 'orange' },
  { label: 'Raspberry', value: 'raspberry' },
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
  useHookFormPersist: () => ({}),
  onSubmit: () => console.log('onSave called'),
  handleGoBack: () => console.log('handleGoBack called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  userFarmOptions: userFarmOptions,
  persistedFormData: {},
};

export const TaskAssignmentFarmWorker = Template.bind({});
TaskAssignmentFarmWorker.args = {
  useHookFormPersist: () => ({}),
  onSubmit: () => console.log('onSave called'),
  handleGoBack: () => console.log('handleGoBack called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  userFarmOptions: oneUser,
  isFarmWorker: true,
  persistedFormData: {},
};

export const TaskAssignmentOneUser = Template.bind({});
TaskAssignmentOneUser.args = {
  useHookFormPersist: () => ({}),
  onSubmit: () => console.log('onSave called'),
  handleGoBack: () => console.log('handleGoBack called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  userFarmOptions: oneUser,
  persistedFormData: {},
};

export const TaskAssignmentMoreThanEightUsers = Template.bind({});
TaskAssignmentMoreThanEightUsers.args = {
  useHookFormPersist: () => ({}),
  onSubmit: () => console.log('onSave called'),
  handleGoBack: () => console.log('handleGoBack called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  userFarmOptions: moreThanEightUsers,
  persistedFormData: {},
};
