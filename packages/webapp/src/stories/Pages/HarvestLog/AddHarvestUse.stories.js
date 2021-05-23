import React from 'react';
import decorators from '../config/decorators';
import PureAddHarvestUse from '../../../components/Logs/PureAddHarvestUse';

export default {
  title: 'Form/AddHarvestUse',
  decorators: decorators,
  component: PureAddHarvestUse,
};

const Template = (args) => <PureAddHarvestUse {...args} />;

export const Add = Template.bind({});
Add.args = {
  title: 'Add harvest use',
};

export const Edit = Template.bind({});
Edit.args = {
  title: 'Edit harvest use',
  defaultHarvestUseName: 'Harvest use name1',
};
