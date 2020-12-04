import React from 'react';
import { Underlined } from '../../components/Typography';
import OverlayTooltip from '../../components/Tooltip';
export default {
  title: 'Components/OverlayTooltip',
  component: OverlayTooltip,
  decorators: [
    (story) => (
      <div style={{ padding: '3rem' }}>
        <h4>To be reworked due to bootstrap styling solution</h4>
        {story()}
      </div>
    ),
  ],
};

const Template = (args) => <OverlayTooltip {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: <Underlined>Why are we asking this?</Underlined>,
  content:
    'LiteFarm generates forms required for organic certification. Some information will be mandatory.',
  marginTop: '12px',
  arrowTranslateX: '16px',
  placement: 'bottom-start',
};
