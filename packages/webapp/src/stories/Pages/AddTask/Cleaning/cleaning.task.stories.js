import React from 'react';
import decorators from '../../config/decorators';
import { chromaticSmallScreen } from '../../config/chromatic';
import PureCleaningTask from '../../../../components/AddTask/CleaningTask';

export default {
  title: 'Page/AddCleaning',
  decorators: decorators,
  component: PureCleaningTask,
};

const Template = (args) => <PureCleaningTask {...args} />;

export const CleaningTask = Template.bind({});
CleaningTask.args = {
  useHookFormPersist: () => {},
  onSubmit: () => console.log('onSave called'),
  handleGoBack: () => console.log('handleGoBack called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
};
