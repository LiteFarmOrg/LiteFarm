import React from 'react';
import ModalComponent from './ModalComponent/v1';
import { Dialog } from '@material-ui/core';

function Modal({ children, dismissModal }) {
  return (
    <Dialog
      component={children}
      // PaperProps={{ className: classes.paper }}
      // fullWidth={true}
      open={true}
      onClose={dismissModal}
      // scroll={'body'}
      // classes={{ root: classes.root }}
    >
      {children}
    </Dialog>
  );
}

export { Modal, ModalComponent };
