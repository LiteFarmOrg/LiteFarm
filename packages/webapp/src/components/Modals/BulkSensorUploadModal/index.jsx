import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '..';
import styles from './styles.module.scss';
import { Semibold, Underlined, Label } from '../../Typography';
import Button from '../../Form/Button';
import { BsChevronLeft } from 'react-icons/bs';
import PropTypes from 'prop-types';
import FileUploader from './FilterUploader';
export default function BulkSensorUploadModal({
  title,
  uploadLinkMessage,
  uploadInstructionMessage,
  uploadPlaceholder,
  dismissModal,
  onUpload,
  disabled,
  handleSelectedFile,
  selectedFileName,
  fileInputRef,
}) {
  const { t } = useTranslation();

  return (
    <Modal dismissModal={dismissModal}>
      <div className={styles.container}>
        <div className={styles.modalHeaderWrapper}>
          <button type={'button'} className={styles.buttonContainer} onClick={dismissModal}>
            <BsChevronLeft style={{ fontSize: '20px' }} />
          </button>
          <Semibold className={styles.title}>{title}</Semibold>
        </div>
        <Label>
          <Underlined>{uploadLinkMessage}</Underlined>&nbsp;{uploadInstructionMessage}
        </Label>
        <form onSubmit={onUpload}>
          <div className={styles.uploadPlaceholder}>
            <label>{uploadPlaceholder}</label>
          </div>
          <FileUploader
            handleSelectedFile={handleSelectedFile}
            acceptedFormat=".csv"
            selectedFileName={selectedFileName}
            fileInputRef={fileInputRef}
          />
          <Button
            className={styles.buttonUpload}
            type="submit"
            disabled={disabled}
            sm
            onClick={onUpload}
          >
            {t('common:UPLOAD')}
          </Button>
        </form>
      </div>
    </Modal>
  );
}

BulkSensorUploadModal.prototype = {
  title: PropTypes.string,
  uploadInstructionMessage: PropTypes.string,
  uploadPlaceholder: PropTypes.string,
  dismissModal: PropTypes.func,
  disabled: PropTypes.bool,
  onUpload: PropTypes.func,
  handleSelectedFile: PropTypes.func,
  selectedFileName: PropTypes.string,
  fileInputRef: PropTypes.func,
};
