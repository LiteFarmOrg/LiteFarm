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
  variety: {
    cropName: 'Carrot',
    varietyName: 'Nantes',
    supplierName: 'Buckerfields',
    supplier: 'Supplier 1',
  },
};
