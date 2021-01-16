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
    { value: 'OWNER', label: 'Farm Owner' },
    { value: 'MANAGER', label: 'Farm Manager' },
    { value: 'WORKER', label: 'Farm Worker' },
    { value: 'EXTENSION', label: 'Extension Officer' },
  ]
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
