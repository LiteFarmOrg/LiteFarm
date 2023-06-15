import React from 'react';
import ModalComponent from './ModalComponent/v1';
import { Dialog } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    overflow: 'inherit',
  },
}));

function Modal({ children, dismissModal }) {
  const classes = useStyles();
  return (
    <Dialog
      component={children}
      PaperProps={{ className: classes.paper }}
      open={true}
      onClose={dismissModal}
    >
      {children}
    </Dialog>
  );
}

export { Modal, ModalComponent };
