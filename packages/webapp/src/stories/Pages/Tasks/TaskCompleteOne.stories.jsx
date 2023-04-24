import React from 'react';
import PureCompleteStepOne from '../../../components/Task/TaskComplete/StepOne';
import decorator from '../config/Decorators';

export default {
  title: 'Form/Crop/Tasks/TaskComplete-1',
  component: PureCompleteStepOne,
  decorators: decorator,
};

const Template = (args) => <PureCompleteStepOne {...args} />;

export const TaskCompleteCleaning = Template.bind({});
TaskCompleteCleaning.args = {
  onCancel: () => {},
  onGoBack: () => {},
  onSave: () => {},
  useHookFormPersist: () => ({}),
  persistedFormData: {
    need_changes: true,
    cleaning_task: {
      cleaning_target: 'target',
      agent_used: true,
      water_usage: 50,
      water_usage_unit: 'l',
      product_id: 2,
      product_quantity: 300,
      product_quantity_unit: 'ml',
      product: {
        name: 'Test product',
        supplier: 'Test supplier',
        type: 'cleaning_task',
        on_permitted_substances_list: 'YES',
        farm_id: '1231456',
      },
    },
  },
  selectedTaskType: { task_translation_key: 'CLEANING_TASK' },
  farm: '1231456',
  system: 'metric',
  products: [
    {
      product_id: 2,
      name: 'Test product',
      supplier: 'Test supplier',
      type: 'cleaning_task',
      on_permitted_substances_list: true,
      farm_id: '1231456',
    },
  ],
};
