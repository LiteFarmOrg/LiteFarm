import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, Tooltip } from '@material-ui/core';
import { colors } from '../../assets/theme';

const useStyles = ({ arrowOffset = 0, isChildrenIcon } = {}) =>
  makeStyles((theme) => ({
    arrow: {
      zIndex: -1,
      color: 'var(--grey400)',
      width: '20px',
      height: '10px',
      overflow: 'initial',
      '&::before': {
        width: '29px',
        height: '15px',
        transform: `translate(${arrowOffset}px, -4px) rotate(45deg)`,
      },
    },
    tooltip: {
      zIndex: 1000,
      backgroundColor: 'var(--grey400)',
      padding: '12px 16px',
      boxShadow: '2px 6px 12px rgba(102, 115, 138, 0.2)',
      borderRadius: '4px',
      textAlign: 'left',
      maxWidth: '264px',
      userSelect: 'none',
      marginTop: isChildrenIcon ? '8px' : '16px',
      fontSize: '14px',
      lineHeight: '24px',
      color: colors.grey900,
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontFamily: 'Open Sans, SansSerif, serif',
    },
    childrenContainer: {
      userSelect: 'none',
      '& svg': {
        color: colors.teal700,
        fontSize: '16px',
      },
    },
  }));
export default function OverlayTooltip({
  children = 'LiteFarm',
  content = 'LiteFarm',
  placement,
  arrowOffset,
  eventDelay,
  autoOpen,
  isChildrenIcon,
  icon,
  ...props
}) {
  const classes = useStyles({ arrowOffset, isChildrenIcon: !!icon || isChildrenIcon })();
  return (
    <Tooltip
      title={content}
      placement={placement}
      arrow={true}
      classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
      enterTouchDelay={10}
      leaveTouchDelay={900000}
      eventDelay={eventDelay}
    >
      <span className={classes.childrenContainer}>{icon || children}</span>
    </Tooltip>
  );
}

OverlayTooltip.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  content: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  placement: PropTypes.string,
  arrowOffset: PropTypes.number,
  eventDelay: PropTypes.number,
  style: PropTypes.objectOf(PropTypes.string),
  autoOpen: PropTypes.bool,
};
