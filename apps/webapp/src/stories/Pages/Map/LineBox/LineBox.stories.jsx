import React from 'react';
import PureLineBox from '../../../../components/Map/LineMapBoxes/index';
import { decoratorsWithStore } from '../../config/Decorators';

export default {
  title: 'Components/LineBox',
  component: PureLineBox,
  decorators: decoratorsWithStore,
};

const Template = (args) => <PureLineBox {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  locationData: { width: 8 },
  system: 'imperial',
  updateWidth: () => {},
};
