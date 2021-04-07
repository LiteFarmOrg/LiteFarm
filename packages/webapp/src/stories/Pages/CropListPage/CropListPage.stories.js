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
      startDate: "2020-12-25T15:02:31.440Z",
      crop: {
        crop_translation_key: "CARROT",
      }
    },
    {
      variety: "Neptune",
      startDate: "2020-12-25T15:02:31.440Z",
      crop: {
        crop_translation_key: "CARROT",
      }
    },
    {
      variety: "Rainbow Blend",
      startDate: "2020-12-25T15:02:31.440Z",
      crop: {
        crop_translation_key: "CARROT",
      }
    },
  ],
  pastCrops: [
    {
      variety: "Bolero",
      startDate: "2020-05-08T15:02:31.440Z",
      crop: {
        crop_translation_key: "CARROT",
      }
    }
  ],
  plannedCrops: [
    {
      variety: "Bolero",
      startDate: "2021-05-08T15:02:31.440Z",
      crop: {
        crop_translation_key: "CARROT",
      }
    },
    {
      variety: "Neptune",
      startDate: "2021-05-16T15:02:31.440Z",
      crop: {
        crop_translation_key: "CARROT",
      }
    },
    {
      variety: "Ya ya",
      startDate: "2021-06-04T15:02:31.440Z",
      crop: {
        crop_translation_key: "CARROT",
      }
    }
  ],
};
