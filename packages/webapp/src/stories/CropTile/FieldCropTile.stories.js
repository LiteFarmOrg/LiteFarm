import React from 'react';
import PureFieldCropTile from '../../components/CropTile/FieldCropTile';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/CropTile/FieldCropTile',
  component: PureFieldCropTile,
  decorators: componentDecorators,
};

const Template = (args) => (
  <div style={{ height: '140px' }}>
    <PureFieldCropTile {...args} />
  </div>
);
export const Active = Template.bind({});
Active.args = {
  fieldCrop: {
    variety: 'Bolero',
    start_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
  },
  status: 'Active',
};

export const Planned = Template.bind({});
Planned.args = {
  fieldCrop: {
    variety: 'Bolero',
    start_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
  },
  status: 'Planned',
};

export const Past = Template.bind({});
Past.args = {
  fieldCrop: {
    variety: 'Bolero',
    start_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
  },
  status: 'Past',
};
//
// export const CropCount = Template.bind({});
// CropCount.args = {
//   children: <Semibold>Blueberry</Semibold>,
//   cropCount: {
//     active: 8,
//     planned: 8,
//     past: 8,
//   },
// };
