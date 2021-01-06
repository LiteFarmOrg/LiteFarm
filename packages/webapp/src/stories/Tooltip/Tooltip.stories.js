import React from 'react';
import { Text, Underlined } from '../../components/Typography';
import OverlayTooltip, { TooltipComponent } from '../../components/Tooltip';
export default {
  title: 'Components/OverlayTooltip',
  component: OverlayTooltip,
  decorators: [(story) => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <OverlayTooltip {...args} />;

export const Tooltip = Template.bind({});
const underlined = `Why are we asking this?`;
Tooltip.args = {
  children: (
    <Underlined style={{ marginLeft: '-100px', transform: 'translateX(100px)' }}>
      {underlined}
    </Underlined>
  ),
  content:
    'LiteFarm generates forms required for organic certification. Some information will be mandatory.',
  offset: 8,
  placement: 'bottom-start',
  autoOpen: true,
};

const TooltipComponentTemplate = (args) => <TooltipComponent {...args} />;
export const Component = TooltipComponentTemplate.bind({});
Component.args = {
  children: (
    <Text>
      LiteFarm generates forms required for organic certification. Some information will be
      mandatory.
    </Text>
  ),
};
