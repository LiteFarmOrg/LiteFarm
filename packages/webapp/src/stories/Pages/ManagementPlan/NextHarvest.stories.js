import React from 'react';
import PureNextHarvest from '../../../components/Crop/PlantingDate/NextHarvest';
import decorators from '../config/decorators';

export default {
  title: 'Form/ManagementPlan/NextHarvest',
  component: PureNextHarvest,
  decorators: decorators,
};

const Template = (args) => <PureNextHarvest {...args} />;

export const Management = Template.bind({});
Management.args = {
  useHookFormPersist: () => {},
  persistedFormData: { crop_management_plan: {} },
  system: 'metric',
};
