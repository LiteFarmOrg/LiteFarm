import React from 'react';
import ChooseFarmMenuItem from '../../components/ChooseFarm/ChooseFarmMenu/ChooseFarmMenuItem';

export default {
  title: 'Components/MenuItem/ChooseFarm',
  component: ChooseFarmMenuItem,
  decorators: [(story) => <div style={{ padding: '24px' }}>{story()}</div>],
};

const Template = (args) => <ChooseFarmMenuItem {...args} />;
const address = ['547 Silly St', 'Toronto, ON', 'V0T 5Y6'];

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  ownerName: 'Owner name',
  address,
};

const coordinate = [48.77869, -123.707939];
export const Active = Template.bind({});
Active.args = {
  color: 'active',
  ownerName: 'Owner name',
  address: coordinate,
};

export const Disabled = Template.bind({});
Disabled.args = {
  color: 'disabled',
  ownerName: 'Owner name',
  address: coordinate,
};

export const SecondaryWithoutOwnerName = Template.bind({});
SecondaryWithoutOwnerName.args = {
  color: 'secondary',
  children: 'Secondary',
  address: address,
};

export const Invited = Template.bind({});
Invited.args = {
  color: 'blue',
  ownerName: 'Owner name',
  address: coordinate,
};

export const InvitedActive = Template.bind({});
InvitedActive.args = {
  color: 'blueActive',
  ownerName: 'Owner name',
  address: coordinate,
};
