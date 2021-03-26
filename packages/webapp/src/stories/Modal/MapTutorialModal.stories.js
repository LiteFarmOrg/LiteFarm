import React from 'react';
import MapTutorialModal from '../../components/Modals/MapTutorialModal';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Modals/MapTutorialModal',
  decorators: componentDecorators,
  component: MapTutorialModal,
};

const Template = (args) => <MapTutorialModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'Tutorial title',
  steps: [
    'Step 1',
    'Step 2',
    'Step 3',
  ]
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
