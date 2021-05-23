import { Dialog } from '@material-ui/core';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: '96px 24px 24px 24px',
    margin: '0',
    borderRadius: 0,
    maxWidth: '100% !important',
    width: '100% !important',
    minHeight: '100%',
  },
  root: {
    zIndex: '1000 !important',
  },
}));

//TODO: to deprecate
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
      {children}
    </Dialog>
  );
}
