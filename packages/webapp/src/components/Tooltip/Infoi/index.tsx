import { AiOutlineInfoCircle } from 'react-icons/ai';
import OverlayTooltip, { OverlayTooltipProps } from '../';
import React from 'react';

export default function Infoi({
  content,
  placement = 'bottom',
  style,
  ...props
}: OverlayTooltipProps) {
  return (
    <OverlayTooltip
      placement={placement}
      content={content}
      icon={<AiOutlineInfoCircle style={{ fontSize: '18px', ...style }} />}
      {...props}
    />
  );
}
