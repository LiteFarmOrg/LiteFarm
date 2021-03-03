import Floater from 'react-floater';
import React from 'react';
import ModalComponent from './ModalComponent';

function Modal({ children, dismissModal }) {
  return (
    <>
      <Floater
        autoOpen
        placement={'center'}
        styles={{ floaterCentered: { transform: 'translate(-50%, -70%)', zIndex: 1400 } }}
        component={children}
      />
      <div
        onClick={dismissModal}
        style={{
          position: 'fixed',
          zIndex: 1400,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: 'rgba(25, 25, 40, 0.8)',
        }}
      />
    </>
  );
}

export { Modal, ModalComponent };
