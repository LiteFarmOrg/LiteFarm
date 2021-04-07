import React from 'react';
import PureCropTile from '../../components/CropTile';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/CropTile',
  component: PureCropTile,
  decorators: componentDecorators,
};

const Template = (args) => <div style={{height: "140px"}}>
  <PureCropTile {...args} />
</div>;
export const Active = Template.bind({});
Active.args = {
  fieldCrop: {
    variety: "Bolero",
    startDate: "2020-12-25T15:02:31.440Z",
    crop: {
      crop_translation_key: "CARROT",
    }
  },
  status: 'Current',
};

export const Planned = Template.bind({});
Planned.args = {
  fieldCrop: {
    variety: "Bolero",
    startDate: "2020-12-25T15:02:31.440Z",
    crop: {
      crop_translation_key: "CARROT",
    }
  },
  status: 'Planned',
};

export const Past = Template.bind({});
Past.args = {
  fieldCrop: {
    variety: "Bolero",
    startDate: "2020-12-25T15:02:31.440Z",
    crop: {
      crop_translation_key: "CARROT",
    }
  },
  status: 'Past',
};
