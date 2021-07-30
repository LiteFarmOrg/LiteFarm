import React from 'react';
import PureTaskDate from '../../../components/Task/TaskDate';
import decorator from '../config/decorators';

export default {
  title: 'Form/Crop/Tasks/TaskDate',
  component: PureTaskDate,
  decorators: decorator,
};

const Template = (args) => <PureTaskDate {...args} />;

export const TaskDate = Template.bind({});
TaskDate.args = {
  onCancel: () => { },
  onGoBack: () => { },
  onContinue: () => { },
  useHookFormPersist: () => { },
  persistedFormData: {},
};