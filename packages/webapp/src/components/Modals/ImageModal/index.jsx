import React from 'react';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';

export default function ImageModal({ src, alt, dismissModal, ...props }) {
  return (
    <>
      <img src={src} alt={alt} className={styles.imageModal} {...props} />
      <div
        onClick={dismissModal}
        style={{
          position: 'fixed',
          zIndex: 1299,
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

ImageModal.prototype = {
  dismissModal: PropTypes.func,
  src: PropTypes.string,
  alt: PropTypes.string,
};
