import React from 'react';
import { componentDecorators } from '../Pages/config/Decorators';
import CropHeader from '../../components/Crop/CropHeader';

export default {
  title: 'Components/CropHeader',
  component: CropHeader,
  decorators: componentDecorators,
};

const Template = (args) => <CropHeader {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  crop_translation_key: 'Blueberry',
  crop_variety_name: 'Blueberry 1',
  supplier: 'supplier',
  crop_variety_photo_url:
    'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp',
};
