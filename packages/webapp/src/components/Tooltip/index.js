import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Text } from '../Typography';
import Floater from 'react-floater';
import { ClickAwayListener } from '@material-ui/core';

const OverlayTooltip = ({
  children = 'LiteFarm',
  content = 'LiteFarm',
  placement,
  offset,
  eventDelay,
  style,
  autoOpen,
  ...props
}) => {
  const [isOpen, setOpen] = useState();
  return (
    <>
      <Floater
        placement={placement}
        component={
          <ClickAwayListener onClickAway={() => setOpen(false)}>
            <TooltipComponent style={style}>
              {' '}
              <Text>{content}</Text>
            </TooltipComponent>
          </ClickAwayListener>
        }
        styles={{
          floater: { filter: 'none' },
          arrow: { color: 'var(--grey400)', spread: 20, length: 10 },
        }}
        event="hover"
        offset={offset}
        eventDelay={eventDelay}
        autoOpen={autoOpen}
        open={isOpen}
        {...props}
      >
        {children}
      </Floater>
    </>
  );
};

export function TooltipComponent({ children, style }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--grey400)',
        padding: '12px 16px',
        boxShadow: '2px 6px 12px rgba(102, 115, 138, 0.2)',
        borderRadius: '4px',
        textAlign: 'left',
        maxWidth: '264px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

OverlayTooltip.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  content: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  placement: PropTypes.string,
  offset: PropTypes.number,
  eventDelay: PropTypes.number,
  style: PropTypes.objectOf(PropTypes.string),
  autoOpen: PropTypes.bool,
};
TooltipComponent.prototype = {
  style: PropTypes.objectOf(PropTypes.string),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export default OverlayTooltip;
