import React from 'react';
import PurePeople from '../../../components/Profile/People';
import decorator from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Profile/People',
  decorators: decorator,
  component: PurePeople,
};

const Template = (args) => <PurePeople {...args} />;

export const Primary = Template.bind({});
Primary.args = {
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
  history: {},
  isAdmin: true,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
