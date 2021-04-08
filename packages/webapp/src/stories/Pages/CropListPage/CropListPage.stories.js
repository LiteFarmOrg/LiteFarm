import React from 'react';
import PureCropList from '../../../components/CropListPage';
import { componentDecorators } from '../config/decorators';

export default {
  title: 'Page/CropList',
  component: PureCropList,
  decorators: componentDecorators,
};

const Template = (args) => <PureCropList {...args} />
export const Primary = Template.bind({});
Primary.args = {
  activeCrops: [
    {
      variety: "Bolero",
      start_date: "2020-12-25T15:02:31.440Z",
      crop_translation_key: "CARROT",
    },
    {
      variety: "Neptune",
      start_date: "2020-12-25T15:02:31.440Z",
      crop_translation_key: "CARROT",
    },
    {
      variety: "Rainbow Blend",
      start_date: "2020-12-25T15:02:31.440Z",
      crop_translation_key: "CARROT",
    },
  ],
  pastCrops: [
    {
      variety: "Bolero",
      start_date: "2020-05-08T15:02:31.440Z",
      crop_translation_key: "CARROT",
    }
  ],
  plannedCrops: [
    {
      variety: "Bolero",
      start_date: "2021-05-08T15:02:31.440Z",
      crop_translation_key: "CARROT",
    },
    {
      variety: "Neptune",
      start_date: "2021-05-16T15:02:31.440Z",
      crop_translation_key: "CARROT",
    },
    {
      variety: "Ya ya",
      start_date: "2021-06-04T15:02:31.440Z",
      crop_translation_key: "CARROT",
    }
  ],
  isAdmin: true,
};
