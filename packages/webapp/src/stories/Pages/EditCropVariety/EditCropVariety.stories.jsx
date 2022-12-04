import React from 'react';
import EditCropVariety from '../../../components/EditCropVariety';
import decorators from '../config/Decorators';
import ImagePickerWrapper from '../../../containers/ImagePickerWrapper';
import { AddLink } from '../../../components/Typography';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Crop/EditCropVariety',
  decorators: decorators,
  component: EditCropVariety,
};

const Template = (args) => <EditCropVariety {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  cropVariety: {
    crop_common_name: 'Apricot',
    crop_genus: 'Prunus',
    crop_group: 'Fruit and nuts',
    crop_id: 31,
    crop_photo_url: 'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apricot.webp',
    crop_subgroup: 'Pome fruits and stone fruits',
    crop_translation_key: 'APRICOT',
  },
  imageUploader: (
    <ImagePickerWrapper>
      <AddLink>{'Add image'}</AddLink>
    </ImagePickerWrapper>
  ),
  handleGoBack: () => {},
  isSeekingCert: false,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const SeekingCert = Template.bind({});
SeekingCert.args = {
  cropVariety: {
    crop_common_name: 'Apricot',
    crop_genus: 'Prunus',
    crop_group: 'Fruit and nuts',
    crop_id: 31,
    crop_photo_url: 'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apricot.webp',
    crop_subgroup: 'Pome fruits and stone fruits',
    crop_translation_key: 'APRICOT',
  },
  imageUploader: (
    <ImagePickerWrapper>
      <AddLink>{'Add image'}</AddLink>
    </ImagePickerWrapper>
  ),
  handleGoBack: () => {},
  isSeekingCert: true,
};
SeekingCert.parameters = {
  ...chromaticSmallScreen,
};
