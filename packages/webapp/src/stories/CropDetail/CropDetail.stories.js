import React from 'react';
import PureCropDetail from '../../components/Crop/detail';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Crop/Detail',
  component: PureCropDetail,
  decorators: componentDecorators,
};

const Template = (args) => <PureCropDetail {...args} />;

export const Detail = Template.bind({});
Detail.args = {
  history: {
    location: { pathname: '/crop/2/detail' },
  },
  crop: {
    cropName: 'Carrot',
    varietyName: 'Nantes',
    supplierName: 'Buckerfields',
  },
};
