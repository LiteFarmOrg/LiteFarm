import React from 'react';
import Home  from './../../../containers/Home';
import decorators from '../config/decorators';

export default {
  title: 'Form/Home/HomeWrapper',
  decorators: decorators,
  component: Home,
};

const Template = (args) => <Home {...args}/>;

export const Default = Template.bind({});
Default.args = {

};
