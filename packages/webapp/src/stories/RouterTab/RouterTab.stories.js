import React from 'react';
import RouterTab from '../../components/RouterTab';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/RouterTab',
  component: RouterTab,
  decorators: componentDecorators,
};

const tabs = [
  { label: 'Detail', path: '/detail' },
  { label: 'Crop', path: '/crop' },
  { label: 'User', path: '/user' },
];

const Template = (args) => <RouterTab {...args} />;
export const Left = Template.bind({});
Left.args = {
  tabs,
  history: { location: { pathname: '/detail' } },
};

export const Middle = Template.bind({});
Middle.args = {
  tabs,
  history: { location: { pathname: '/crop' } },
};
