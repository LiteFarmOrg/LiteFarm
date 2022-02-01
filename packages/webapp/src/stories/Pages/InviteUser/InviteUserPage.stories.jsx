import React from 'react';
import decorators from '../config/Decorators';
import PureInviteUser from '../../../components/InviteUser';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/InviteUser',
  decorators: decorators,
  component: PureInviteUser,
};

const Template = (args) => <PureInviteUser {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  roleOptions: [
    { value: 1, label: 'Farm Owner' },
    { value: 2, label: 'Farm Manager' },
    { value: 3, label: 'Farm Worker' },
    { value: 5, label: 'Extension Officer' },
  ],
  onInvite: (data) => console.log(data),
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
