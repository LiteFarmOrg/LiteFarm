import React from 'react';
import Home  from './';
import {authenticatedDecorators} from '../config/decorators';

export default {
  title: 'Form/Home/HomeWrapper',
  decorators: authenticatedDecorators,
  component: Home,
};
const auth = (isAuthenticated = true) => ({
  logout: () => {
  }, isAuthenticated: () => isAuthenticated,
});
const Template = (args) => <Home {...args}/>;

export const Default = Template.bind({});
Default.args = {
  auth: auth(true)
};