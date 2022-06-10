import React from 'react';
import { useTranslation } from 'react-i18next';
import PureBulkSensorUploadModal from '../../../Modals/BulkSensorUploadModal';
import { useValidateBulkSensorData } from './useValidateBulkSensorData';
import PropTypes from 'prop-types';

export default function BulkSensorUploadModal({ dismissModal, onUpload }) {
  const { t } = useTranslation();

  const { validateFileUpload, handleSelectedFile, disabled, selectedFileName, fileInputRef } =
    useValidateBulkSensorData(onUpload);

  return (
    <PureBulkSensorUploadModal
      title={t('FARM_MAP.BULK_UPLOAD_SENSORS.TITLE')}
      uploadLinkMessage={t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_LINK_MESSAGE')}
      uploadInstructionMessage={t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_INSTRUCTION_MESSAGE')}
      uploadPlaceholder={t('FARM_MAP.BULK_UPLOAD_SENSORS.UPLOAD_PLACEHOLDER')}
      dismissModal={dismissModal}
      onUpload={validateFileUpload}
      handleSelectedFile={handleSelectedFile}
      selectedFileName={selectedFileName}
      fileInputRef={fileInputRef}
      disabled={disabled}
    />
  );
}

BulkSensorUploadModal.prototype = {
  dismissModal: PropTypes.func,
  onUpload: PropTypes.func,
};
