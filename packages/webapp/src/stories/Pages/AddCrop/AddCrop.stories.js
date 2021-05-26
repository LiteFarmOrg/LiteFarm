import React from 'react';
import PureAddCrop from '../../../components/AddCrop/';
import decorators from '../config/decorators';
import ImagePickerWrapper from '../../../containers/ImagePickerWrapper';
import { AddLink } from '../../../components/Typography';

export default {
  title: 'Form/AddCrop',
  decorators: decorators,
  component: PureAddCrop,
};

const Template = (args) => <PureAddCrop {...args} />;

const cropEnum = {
  variety: 'VARIETY',
  supplier: 'SUPPLIER',
  seed_type: 'SEED_TYPE',
  life_cycle: 'LIFE_CYCLE',
};

export const Primary = Template.bind({});
Primary.args = {
  cropEnum: cropEnum,
  disabled: true,
  crop: {
    crop_common_name: 'Apricot',
    crop_genus: 'Prunus',
    crop_group: 'Fruit and nuts',
    crop_id: 31,
    crop_photo_url: 'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/apricot.jpg',
    crop_subgroup: 'Pome fruits and stone fruits',
    crop_translation_key: 'APRICOT',
  },
  match: {
    params: {
      crop_id: '31',
    },
  },
  useHookFormPersist: () => ({}),
  imageUploader: (
    <ImagePickerWrapper>
      <AddLink>{'Add image'}</AddLink>
    </ImagePickerWrapper>
  ),
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
