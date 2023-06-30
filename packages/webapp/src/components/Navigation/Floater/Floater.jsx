import { Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { colors } from '../../../assets/theme';

const useStyle = makeStyles((theme) => ({
  arrow: {
    zIndex: -1,
    color: 'white',
    overflow: 'initial',
    width: '32px',
    height: '16px',
    marginTop: '-16px !important',
    '&::before': {
      transform: `translate(4px, 0) rotate(45deg)`,
    },
  },
  tooltip: {
    top: '-8px',
    [theme.breakpoints.up('sm')]: {
      top: '4px',
    },
    pointerEvents: 'initial',
    zIndex: 1000,
    backgroundColor: 'white',
    boxShadow: '2px 6px 12px rgba(102, 115, 138, 0.2)',
    padding: 0,
    borderRadius: '4px',
    maxWidth: '264px',
    textAlign: 'left',
    userSelect: 'none',
    color: colors.grey900,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: 'Open Sans, SansSerif, serif',
  },
}));

export function Floater({ body, children, open, arrow = true, ...props }) {
  const classes = useStyle();
  return (
    <Tooltip
      disableInteractive
      title={body}
      placement={'bottom-end'}
      arrow={arrow}
      classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
      open={open}
      {...props}
    >
      {children}
    </Tooltip>
  );
}
