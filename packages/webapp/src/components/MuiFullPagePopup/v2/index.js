import { Dialog } from '@material-ui/core';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingTop: '56px',
    margin: '0',
    borderRadius: 0,
    maxWidth: '100% !important',
    width: '100% !important',
    minHeight: '100%',
    [theme.breakpoints.up('sm')]: {
      paddingTop: '64px',
    },
    [theme.breakpoints.up('md')]: {
      paddingTop: '72px',
    },
  },
  root: {
    zIndex: '1000 !important',
  },
  container: {
    maxWidth: '1024px',
    display: 'flex',
    minHeight: 'calc(100vh - 56px)',
    [theme.breakpoints.up('sm')]: {
      minHeight: 'calc(100vh - 64px)',
    },
    [theme.breakpoints.up('md')]: {
      minHeight: 'calc(100vh - 72px)',
    },
    margin: 'auto',
  },
}));

export default function MuiFullPagePopup({ open, onClose, children }) {
  const classes = useStyles();
  return (
    <Dialog
      PaperProps={{ className: classes.paper }}
      fullWidth={true}
      open={open}
      onClose={onClose}
      scroll={'body'}
      classes={{ root: classes.root }}
    >
      <div className={classes.container}>{children}</div>
    </Dialog>
  );
}
