import React from 'react';
import PureAccount from '../../../components/Profile/Account';
import decorator from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Profile/Account',
  decorators: decorator,
  component: PureAccount,
};

const Template = (args) => <PureAccount {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: { location: { pathname: '/profile' } },
  userFarm: {
    first_name: 'first',
    last_name: 'last',
    email: 'example@litefarm.org',
    phone_number: '123456789',
    user_address: 'litefarm',
  },
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
