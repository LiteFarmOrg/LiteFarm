import React from 'react';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';
import { PureManageCustomTasks } from '../../../components/Task/PureTaskTypeSelection/PureManageCustomTasks';

export default {
  title: 'Page/Task/PureManageCustomTasks',
  decorators: decorators,
  component: PureManageCustomTasks,
};
const customTasks = [
  {
    task_type_id: 93,
    task_name: 'custom 1',
    task_translation_key: 'custom 1',
    farm_id: '71d84984-88cc-11eb-84e5-0a7facd3678d',
    deleted: false,
  },
  {
    task_type_id: 94,
    task_name: 'custom 2',
    task_translation_key: 'custom 2',
    farm_id: '71d84984-88cc-11eb-84e5-0a7facd3678d',
    deleted: false,
  },
];
const Template = (args) => <PureManageCustomTasks {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
  persistedFormData: {},
  customTasks,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
