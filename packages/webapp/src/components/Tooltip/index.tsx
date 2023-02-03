import React, { ReactNode } from 'react';
import { makeStyles, Tooltip, TooltipProps } from '@material-ui/core';
import { colors } from '../../assets/theme';

const useStyles = ({ arrowOffset = 0, isChildrenIcon = false }) =>
  makeStyles((theme) => ({
    arrow: {
      zIndex: -1,
      color: 'var(--grey400)',
      // width: '15px',
      overflow: 'initial',
      '&::before': {
        // width: '15px',
        // height: '15px',
        transform: `translate(${arrowOffset}px, 0px) rotate(45deg)`,
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
      margin: isChildrenIcon ? '8px 0' : '16px 0',
      fontSize: '14px',
      lineHeight: '24px',
      color: colors.grey900,
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontFamily: 'Open Sans, SansSerif, serif',
    },
    childrenContainer: {
      userSelect: 'none',
      display: 'flex',
      '& svg': {
        color: colors.teal700,
        fontSize: '16px',
      },
    },
  }));

export type OverlayTooltipProps = Omit<TooltipProps, 'children' | 'title'> & {
  content: TooltipProps['title'];
  children?: ReactNode;
  arrowOffset?: number;
  autoOpen?: boolean;
  isChildrenIcon?: boolean;
  icon?: ReactNode;
};

export default function OverlayTooltip({
  children,
  content,
  placement,
  arrowOffset,
  autoOpen,
  isChildrenIcon,
  icon,
  ...props
}: OverlayTooltipProps) {
  const classes = useStyles({ arrowOffset, isChildrenIcon: !!icon || isChildrenIcon })();
  return (
    <Tooltip
      {...props}
      title={content}
      placement={placement}
      arrow={true}
      classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
      enterTouchDelay={10}
      leaveTouchDelay={900000}
    >
      <span className={classes.childrenContainer}>{icon || children}</span>
    </Tooltip>
  );
}
