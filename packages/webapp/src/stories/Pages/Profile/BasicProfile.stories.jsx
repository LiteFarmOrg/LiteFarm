import React from 'react';
import PureBasicProfile from '../../../components/Profile/FarmSettings/PureBasicProfile';
import decorator from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Profile/FarmSettings/BasicProfile',
  decorators: decorator,
  component: PureBasicProfile,
};

const Template = (args) => <PureBasicProfile {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: { location: { pathname: '/farm' } },
  userFarm: {
    farm_name: 'liteFarm',
    last_name: 'last',
    farm_phone_number: '123456789',
    address: 'litefarm',
    units: {
      measurement: 'imperial',
      currency: 'CAD',
    },
  },
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
