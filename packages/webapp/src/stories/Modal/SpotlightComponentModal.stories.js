import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import SpotlightComponentModal from '../../components/Modals/SpotlightComponentModal';

export default {
    title: 'Components/Modals/SpotlightComponentModal',
    decorators: componentDecorators,
    component: SpotlightComponentModal,
};

const Template = (args) => <SpotlightComponentModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
    chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};