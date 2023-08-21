import React from 'react';
import ImageModal from '../../components/Modals/ImageModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/ImageModal',
  decorators: componentDecorators,
  component: ImageModal,
};

const Template = (args) => <ImageModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  src: 'https://litefarm.nyc3.cdn.digitaloceanspaces.com/planting_method/Rows_1.jpg',
  alt: 'Rows_1',
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
