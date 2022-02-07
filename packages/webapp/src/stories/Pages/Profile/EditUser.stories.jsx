import React from 'react';
import PureEditUser from '../../../components/Profile/EditUser';
import decorator from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Profile/EditUser',
  decorators: decorator,
  component: PureEditUser,
};

const userFarm = {
  wage: { type: 'hourly', amount: 10 },
  first_name: 'first_name',
  last_name: 'last_name',
  email: 'email@example.com',
  role_id: 1,
};
const Template = (args) => <PureEditUser {...args} />;

export const Admin = Template.bind({});
Admin.args = {
  userFarm,
  history: {},
  isAdmin: true,

};
Admin.parameters = {
  ...chromaticSmallScreen,
};

export const Worker = Template.bind({});
Worker.args = {
  userFarm,
  history: {},
  isAdmin: false,

};
Worker.parameters = {
  ...chromaticSmallScreen,
};
