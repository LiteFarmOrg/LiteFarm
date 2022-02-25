import React from 'react';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';
import PureAbandonTask from '../../../components/Task/AbandonTask';

export default {
  title: 'Page/Task/AbandonedTask',
  decorators: decorators,
  component: PureAbandonTask,
};

const Template = (args) => <PureAbandonTask {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  //   useHookFormPersist: () => ({}),
  onSubmit: () => console.log('onSubmit called'),
  onGoBack: () => console.log('handleGoBack called'),
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
