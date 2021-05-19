import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import CropCatalogSearchAndFilterModalModal from '../../components/Modals/CropCatalogSearchAndFilterModal';

export default {
  title: 'Components/Modals/CropCatalogSearchAndFilterModal',
  decorators: componentDecorators,
  component: CropCatalogSearchAndFilterModalModal,
};

const Template = (args) => <CropCatalogSearchAndFilterModalModal {...args} />;
export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
