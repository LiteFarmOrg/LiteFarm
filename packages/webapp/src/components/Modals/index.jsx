import React from 'react';
import ModalComponent from './ModalComponent/v1';
import { Dialog } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    overflow: 'hidden',
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
