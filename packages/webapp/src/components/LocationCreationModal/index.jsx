import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modals';
import styles from './styles.module.scss';
import Button from '../Form/Button';
import PropTypes from 'prop-types';

export default function LocationCreationModal({
  title,
  uploadPlaceholder,
  dismissModal,
  onUpload,
  disabled,
}) {
  const { t } = useTranslation();

  return (
    <Modal dismissModal={dismissModal}>
      <div className={styles.container}></div>
    </Modal>
  );
}

LocationCreationModal.prototype = {
  title: PropTypes.string,
  uploadInstructionMessage: PropTypes.string,
  uploadPlaceholder: PropTypes.string,
  dismissModal: PropTypes.func,
  disabled: PropTypes.bool,
  onUpload: PropTypes.func,
  onTemplateDownloadClick: PropTypes.func,
};
