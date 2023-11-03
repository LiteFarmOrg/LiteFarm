import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import React from 'react';
import ModalComponent from './ModalComponent/v1';

const useStyles = makeStyles((theme) => ({
  paper: {
    overflow: 'inherit',
  },
}));

function Modal({ children, dismissModal }) {
  const classes = useStyles();
  return (
    <Dialog
      PaperProps={{ className: classes.paper }}
      open={true}
      onClose={dismissModal}
      scroll="paper"
    >
      {children}
    </Dialog>
  );
}

export { Modal, ModalComponent };
