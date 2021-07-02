import React from 'react';
import PurePlantedAlready from '../../../components/Crop/PlantedAlready';
import decorators from '../config/decorators';

export default {
  title: 'Form/ManagementPlan/PlantedAlready',
  component: PurePlantedAlready,
  decorators: decorators,
};

const Template = (args) => <PurePlantedAlready {...args} />;

export const Default = Template.bind({});

Default.args = {
  persistedFormData: {},
  useHookFormPersist: () => {},
  onSubmit: (data) => {
    console.log(data);
  },
  onGoBack: () => {},
  onCancel: () => {},
  system: 'metric',
};