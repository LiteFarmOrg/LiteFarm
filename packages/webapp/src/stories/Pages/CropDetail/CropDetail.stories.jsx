import React from 'react';
import PureCropDetail from '../../../components/Crop/Detail';
import decorator from '../config/Decorators';

export default {
  title: 'Form/Crop/Detail',
  component: PureCropDetail,
  decorators: decorator,
};

const Template = (args) => <PureCropDetail {...args} />;

export const Detail = Template.bind({});
Detail.args = {
  history: {
    location: { pathname: '/crop/2/detail' },
  },
  match: {
    params: {
      variety_id: 'variety_id',
    },
  },
  variety: {
    cropName: 'Carrot',
    varietyName: 'Nantes',
    supplierName: 'Buckerfields',
    supplier: 'Supplier 1',
  },
};
