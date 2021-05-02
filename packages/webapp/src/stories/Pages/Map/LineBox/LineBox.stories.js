import React from 'react';
import PureLineBox from '../../../../components/Map/LineMapBoxes/index';
import { decoratorsWithStore } from '../../config/decorators';

export default {
  title: 'Components/LineBox',
  component: PureLineBox,
  decorators: decoratorsWithStore,
};

const Template = (args) => <PureLineBox {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  // text:
  // "This feature is currently under development and may not be ready this season. However, clicking 'Yes' will turn it on for your farm when it is ready.",
};
