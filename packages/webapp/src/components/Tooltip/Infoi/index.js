import { AiOutlineInfoCircle } from 'react-icons/all';
import OverlayTooltip from '../index';
import React from 'react';
import PropTypes from 'prop-types';

export default function Infoi({ content, placement = 'bottom', style, ...props }) {
  return (
    <OverlayTooltip
      placement={placement}
      content={content}
      icon={<AiOutlineInfoCircle style={style} />}
      {...props}
    ></OverlayTooltip>
  );
}

Infoi.propTypes = {
  style: PropTypes.object,
  content: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  placement: PropTypes.string,
};
