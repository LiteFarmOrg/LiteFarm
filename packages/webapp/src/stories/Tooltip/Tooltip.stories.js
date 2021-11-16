import React from 'react';
import { Underlined } from '../../components/Typography';
import OverlayTooltip from '../../components/Tooltip';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/OverlayTooltip',
  component: OverlayTooltip,
  decorators: componentDecorators,
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
  arrowOffset: 8,
  placement: 'bottom-start',
  autoOpen: true,
};
