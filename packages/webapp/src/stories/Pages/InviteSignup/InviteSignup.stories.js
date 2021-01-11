import React from 'react';
import decorators from '../config/decorators';

import PureInviteSignUp from '../../../components/InviteSignUp';

export default {
  title: 'Page/InviteSignUp',
  decorators: decorators,
  component: PureInviteSignUp,
};

const Template = (args) => <PureInviteSignUp {...args} />;

export const NotSelected = Template.bind({});
NotSelected.args = {};
NotSelected.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const ButtonSelected = Template.bind({});
ButtonSelected.args = {};
ButtonSelected.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
