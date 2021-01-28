import React from 'react';
import decorators from '../config/decorators';
import PureInviteUser from '../../../components/InviteUser';

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
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
