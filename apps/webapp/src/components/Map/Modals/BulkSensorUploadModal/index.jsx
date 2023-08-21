import React from 'react';
import { useTranslation } from 'react-i18next';
import PureBulkSensorUploadModal from '../../../Modals/BulkSensorUploadModal';
import { useValidateBulkSensorData } from './useValidateBulkSensorData';
import PropTypes from 'prop-types';

export default function BulkSensorUploadModal({ dismissModal, onUpload }) {
  const { t } = useTranslation();

  const {
    onUploadClicked,
    handleSelectedFile,
    onShowErrorClick,
    disabled,
    selectedFileName,
    fileInputRef,
    errorCount,
    onTemplateDownloadClick,
    uploadErrorMessage,
    errorTypeCode,
  } = useValidateBulkSensorData(onUpload, t);

  return (
    <PureBulkSensorUploadModal
      title={t('FARM_MAP.BULK_UPLOAD_SENSORS.TITLE')}
      uploadLinkMessage={t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_LINK_MESSAGE')}
      uploadInstructionMessage={t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_INSTRUCTION_MESSAGE')}
      uploadPlaceholder={t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_PLACEHOLDER')}
      uploadErrorMessage={uploadErrorMessage}
      uploadErrorLink={t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_ERROR_LINK')}
      invalidFileTypeErrorLink={t('FARM_MAP.BULK_UPLOAD_SENSORS.DOWNLOAD_TEMPLATE_LINK_MESSAGE')}
      dismissModal={dismissModal}
      onUpload={onUploadClicked}
      handleSelectedFile={handleSelectedFile}
      selectedFileName={selectedFileName}
      fileInputRef={fileInputRef}
      disabled={disabled}
      errorCount={errorCount}
      onShowErrorClick={onShowErrorClick}
      onTemplateDownloadClick={onTemplateDownloadClick}
      errorTypeCode={errorTypeCode}
    />
  );
}

BulkSensorUploadModal.prototype = {
  dismissModal: PropTypes.func,
  onUpload: PropTypes.func,
};
