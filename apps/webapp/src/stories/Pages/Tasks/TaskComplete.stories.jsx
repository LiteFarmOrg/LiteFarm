import React from 'react';
import PureTaskComplete from '../../../components/Task/TaskComplete';
import decorator from '../config/Decorators';

export default {
  title: 'Form/Crop/Tasks/TaskComplete',
  component: PureTaskComplete,
  decorators: decorator,
};

const Template = (args) => <PureTaskComplete {...args} />;

export const TaskComplete = Template.bind({});
TaskComplete.args = {
  onCancel: () => {},
  onGoBack: () => {},
  onSave: () => {},
  useHookFormPersist: () => ({}),
  persistedFormData: {},
};
