import React from 'react';
import MenuItem from '../../components/MenuItem';

export default {
  title: 'Components/MenuItem',
  component: MenuItem,
  decorators: [(story) => <div style={{ padding: '24px' }}>{story()}</div>],
};

const Template = (args) => <MenuItem {...args} />;

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  label: 'Fraser Valley Organic Producers Association (FVOPA)',
};

export const Active = Template.bind({});
Active.args = {
  color: 'active',
  label: 'Similkameen Okanagan Organic Producers Association (SOOPA)',
};
