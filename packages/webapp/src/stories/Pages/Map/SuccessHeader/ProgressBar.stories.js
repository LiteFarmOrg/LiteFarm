import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/decorators';
import ProgressBar from '../../../../components/Map/ProgressBar';

export default {
  title: 'Components/Map/ProgressBar',
  component: ProgressBar,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <ProgressBar {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  closeSuccessHeader: () => {},
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
