import {authenticatedDecorators} from '../config/decorators';
import React from 'react';
import Home  from '../../../containers/Home';

export default {
  title: 'Form/Home/HomeWrapper',
  decorators: authenticatedDecorators,
  component: Home,
};

const Template = (args) => <Home {...args}/>;

export const Default = Template.bind({});
Default.args = {

};
