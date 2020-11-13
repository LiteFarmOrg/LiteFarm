import React from 'react';
import ChooseFarmMenuItem from '../../components/ChooseFarm/ChooseFarmMenu/ChooseFarmMenuItem';

export default {
  title: 'Components/ChooseFarmMenuItem',
  component: ChooseFarmMenuItem,
  decorators: [story => <div style={{ padding: '24px' }}>{story()}</div>],
};

const Template = (args) => <ChooseFarmMenuItem {...args} />;
const address = {street: '547 Silly St', city:'Toronto, ON', zipcode: 'V0T 5Y6'}

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  ownerName: 'Owner name',
  address,
};

const coordinate = {lat: 48.778690, lon: -123.707939}
export const Active = Template.bind({});
Active.args = {
  color: 'active',
  ownerName: 'Owner name',
  coordinate
};

export const Disabled = Template.bind({});
Disabled.args = {
  color: 'disabled',
  ownerName: 'Owner name',
  coordinate
};

export const SecondaryWithoutOwnerName = Template.bind({});
SecondaryWithoutOwnerName.args = {
  color: 'secondary',
  children: 'Secondary',
  address
};