import React from 'react';
import CertifierSelectionMenuItem from '../../components/CertifierSelection/CertifierSelectionMenu/CertiferSelectionMenuItem';

export default {
  title: 'Components/MenuItem/CertifierSelection',
  component: CertifierSelectionMenuItem,
  decorators: [(story) => <div style={{ padding: '24px' }}>{story()}</div>],
};

const Template = (args) => <CertifierSelectionMenuItem {...args} />;

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  certifierName: 'Fraser Valley Organic Producers Association (FVOPA)',
};

export const Active = Template.bind({});
Active.args = {
  color: 'active',
  certifierName: 'Similkameen Okanagan Organic Producers Association (SOOPA)',
};
