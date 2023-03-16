import React from 'react';
import { componentDecorators } from '../Pages/config/Decorators';
import CropStatusInfoBox from '../../components/CropCatalogue/CropStatusInfoBox';

export default {
  title: 'Components/CropStatusInfoBox',
  component: CropStatusInfoBox,
  decorators: componentDecorators,
};

const Template = (args) => <CropStatusInfoBox {...args} />;
export const Default = Template.bind({});
Default.args = {
  status: {
    active: 8,
    planned: 8,
    abandoned: 0,
    completed: 8,
    noPlans: 0,
  },
  // defaultDate: 'Sept 12, 2021',
};

export const WithoutStatus = Template.bind({});
WithoutStatus.args = {
  // defaultDate: 'Sept 12, 2021',
};
