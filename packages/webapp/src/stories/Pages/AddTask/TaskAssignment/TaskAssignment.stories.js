import React from 'react';
import decorators from '../../config/decorators';
import { chromaticSmallScreen } from '../../config/chromatic';
import PureTaskAssignment from '../../../../components/AddTask/PureTaskAssignment';

export default {
  title: 'Page/AddTask',
  decorators: decorators,
  component: PureTaskAssignment,
};

const Template = (args) => <PureTaskAssignment {...args} />;

export const TaskAssignment = Template.bind({});

TaskAssignment.args = {
  onSubmit: () => console.log('onSave called'),
  handleGoBack: () => console.log('handleGoBack called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
};
