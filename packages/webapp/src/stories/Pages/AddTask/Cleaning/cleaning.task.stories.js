import React from 'react';
import decorators from '../../config/decorators';
import { chromaticSmallScreen } from '../../config/chromatic';
import PureTaskDetails from '../../../../components/AddTask/PureTaskDetails';

export default {
  title: 'Page/AddCleaningTask',
  decorators: decorators,
  component: PureTaskDetails,
};

const Template = (args) => <PureTaskDetails {...args} />;

export const CleaningTask = Template.bind({});
CleaningTask.args = {
  handleGoBack: () => console.log('handleGoBack called'),
  onSubmit: () => console.log('onSave called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  useHookFormPersist: () => {},
  persistedFormData: {task_type: 'cleaning'},
  persistedPaths : [],
  products :[],
  system: 'metric'
};
