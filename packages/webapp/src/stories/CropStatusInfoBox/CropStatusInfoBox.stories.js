import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import CropStatusInfoBox from '../../components/CropCatalog/CropStatusInfoBox';

export default {
  title: 'Components/CropStatusInfoBox',
  component: CropStatusInfoBox,
  decorators: componentDecorators,
};

const Template = (args) => <CropStatusInfoBox {...args} />;
export const Default = Template.bind({});
Default.args = {
  active: 8,
  planned: 8,
  past: 8,
  date: 'Sept 12, 2021',
};
