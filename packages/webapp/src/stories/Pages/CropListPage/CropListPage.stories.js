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
  activeCrops: ["placeholder"],
};
