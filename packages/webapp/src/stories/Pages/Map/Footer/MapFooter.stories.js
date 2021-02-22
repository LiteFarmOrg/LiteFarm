import React from 'react';
import decorators from '../../config/decorators';
import PureMapFooter from '../../../../components/Map/Footer/';

export default {
  title: 'Components/Map/MapFooter',
  component: PureMapFooter,
};

const Template = (args) => <PureMapFooter {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
