import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import CropCatalogSpotlightModal from '../../components/Modals/CropCatalogSpotlightModal';

export default {
  title: 'Components/Modals/CropCatalogSpotlightModal',
  decorators: componentDecorators,
  component: CropCatalogSpotlightModal,
};

const Template = (args) => <CropCatalogSpotlightModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
