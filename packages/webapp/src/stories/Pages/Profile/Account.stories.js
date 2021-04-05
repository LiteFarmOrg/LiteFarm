import React from 'react';
import PureAccount from '../../../components/Profile/Account';
import decorator from '../config/decorators';

export default {
  title: 'Form/Profile/Account',
  decorators: decorator,
  component: PureAccount,
};

const Template = (args) => <PureAccount {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  userFarm: {
    first_name: 'first',
    last_name: 'last',
    email: 'example@litefarm.org',
    phone_number: '123456789',
    user_address: 'litefarm',
  },
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
