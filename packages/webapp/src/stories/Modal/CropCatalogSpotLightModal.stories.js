import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import CropCatalogSpotLightModal from '../../components/Modals/CropCatalogSpotLightModal';

export default {
  title: 'Components/Modals/CropCatalogSpotLightModal',
  decorators: componentDecorators,
  component: CropCatalogSpotLightModal,
};

const Template = (args) => <CropCatalogSpotLightModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
