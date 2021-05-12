import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/decorators';
import PureVideo from '../../../../components/Map/Videos/index';

export default {
  title: 'Components/Map/Videos',
  component: PureVideo,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <PureVideo {...args} />;

export const Primary = Template.bind({});
Primary.args = {
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
