import React from 'react';
import PureAddHarvestUse from '../../../components/AddHarvestUse';

export default {
  title: 'Form/AddHarvestUse',
  decorators: [(story) => <div>{story()}</div>],
  component: PureAddHarvestUse,
};

const Template = (args) => <PureAddHarvestUse {...args} />;

export const HarvestUse = Template.bind({});
HarvestUse.args = {
  title: "Add a harvest use",
  inputHeader: "Name of the custom harvest use"
};
HarvestUse.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
