import { authenticatedDecorators } from '../config/Decorators';
import React from 'react';
import Home from '../../../containers/Home';

// TODO: LF-5221 Fix error "Cannot refetch a query that has not been started yet." or delete the story
export default {
  title: 'Form/Home/HomeWrapper',
  decorators: authenticatedDecorators,
  component: Home,
};

const Template = (args) => <Home {...args} />;

export const Default = Template.bind({});
Default.args = {};
Default.parameters = {
  chromatic: { disable: true },
};
