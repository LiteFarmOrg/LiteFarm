import React from 'react';
import ModalComponent from './ModalComponent/v1';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    overflow: 'inherit',
  },
}));

function Modal({ children, dismissModal }) {
  const classes = useStyles();
  return (
    <Dialog PaperProps={{ className: classes.paper }} open={true} onClose={dismissModal}>
      {children}
    </Dialog>
  );
}

export { Modal, ModalComponent };
