import React from 'react';
import PureAddCrop from '../../../components/AddCrop/';
import decorators from '../config/decorators';

export default {
  title: 'Form/AddCrop',
  decorators: decorators,
  component: PureAddCrop,
};

const Template = (args) => <PureAddCrop {...args} />;

const cropEnum = {
  variety: 'VARIETY',
  supplier: 'SUPPLIER',
  seed_type: 'SEED_TYPE',
  life_cycle: 'LIFE_CYCLE',
};

export const Primary = Template.bind({});
Primary.args = {
  cropEnum: cropEnum,
  disabled: true,
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
