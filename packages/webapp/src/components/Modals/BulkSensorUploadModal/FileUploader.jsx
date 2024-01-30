import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import UploadIcon from '../../../assets/images/map/upload.svg';
import { Label, Underlined } from '../../Typography';
import clsx from 'clsx';

export default function FileUploader({
  handleSelectedFile,
  acceptedFormat,
  selectedFileName,
  fileInputRef,
  isValid,
  onShowErrorClick,
  uploadErrorLink,
  uploadErrorMessage,
  errorTypeCode,
  invalidFileTypeErrorLink,
}) {
  const handleClick = (event) => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    fileInputRef.current.click();
  };

  const handleChange = (event) => handleSelectedFile(event);
  return (
    <>
      <div
        className={clsx(isValid ? styles.uploadSelectInput : styles.invalidateUploadSelectInput)}
        onClick={handleClick}
      >
        <UploadIcon className={styles.uploadIconContainer} />
        <Label className={styles.fileNameLabel}>{selectedFileName}</Label>
      </div>
      <input
        onChange={handleChange}
        type="file"
        accept={acceptedFormat}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      {!isValid && (
        <div className={styles.csvErrorMessageWrapper}>
          <label>
            {uploadErrorMessage}{' '}
            {!errorTypeCode && (
              <span className={styles.errorMessage} onClick={() => onShowErrorClick(errorTypeCode)}>
                {uploadErrorLink}
              </span>
            )}
            {errorTypeCode === 2 && (
              <span className={styles.errorMessage} onClick={() => onShowErrorClick(errorTypeCode)}>
                {invalidFileTypeErrorLink}
              </span>
            )}
          </label>
        </div>
      )}
    </>
  );
}

FileUploader.prototype = {
  handleFile: PropTypes.func,
  selectedFileName: PropTypes.string,
  acceptedFormat: PropTypes.string,
  isValid: PropTypes.bool,
  onShowErrorClick: PropTypes.func,
  uploadErrorLink: PropTypes.string,
  uploadErrorMessage: PropTypes.string,
  errorTypeCode: PropTypes.number,
  invalidFileTypeErrorLink: PropTypes.string,
};
