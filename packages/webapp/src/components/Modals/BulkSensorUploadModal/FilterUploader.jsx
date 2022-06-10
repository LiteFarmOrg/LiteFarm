import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { ReactComponent as UploadIcon } from '../../../assets/images/map/upload.svg';
import { Label } from '../../Typography';

export default function FileUploader({
  handleSelectedFile,
  acceptedFormat,
  selectedFileName,
  fileInputRef,
}) {
  const handleClick = (event) => fileInputRef.current.click();
  const handleChange = (event) => handleSelectedFile(event);

  return (
    <>
      <div className={styles.uploadSelectInput} onClick={handleClick}>
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
    </>
  );
}

FileUploader.prototype = {
  handleFile: PropTypes.func,
  selectedFileName: PropTypes.string,
  acceptedFormat: PropTypes.string,
};
