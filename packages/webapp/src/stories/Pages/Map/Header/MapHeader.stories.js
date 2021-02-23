import React from 'react';
import decorators, { componentDecoratorsWithoutPadding } from '../../config/decorators';
import PureMapHeader from '../../../../components/Map/Header/';

export default {
  title: 'Components/Map/MapHeader',
  component: PureMapHeader,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <PureMapHeader {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  farmName: "Happy Valley",
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
