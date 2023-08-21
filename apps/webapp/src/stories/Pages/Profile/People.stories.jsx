import React from 'react';
import PurePeople from '../../../components/Profile/People';
import decorator from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Profile/People',
  decorators: decorator,
  component: PurePeople,
};

const Template = (args) => <PurePeople {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  history: { location: { pathname: '/people' } },

  users: [
    {
      first_name: 'first',
      last_name: 'last',
      role: 'Owner',
      status: 'Active',
      user_id: '123456778',
      email: 'example@litefarm.org',
    },
  ],
  isAdmin: true,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
