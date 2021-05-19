import React from 'react';
import PureAddNewCrop from '../../../components/AddNewCrop';
import decorators from '../config/decorators';

export default {
  title: 'Form/AddNewCrop',
  decorators: decorators,
  component: PureAddNewCrop,
};

const Template = (args) => <PureAddNewCrop {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
