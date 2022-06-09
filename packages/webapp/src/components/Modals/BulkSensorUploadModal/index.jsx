import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '..';
import styles from './styles.module.scss';
import { Semibold, Underlined, Label } from '../../Typography';
import Button from '../../Form/Button';
import Form from '../../Form';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Input from '../../Form/Input';

export default function BulkSensorUploadModal({
  title,
  uploadLinkMessage,
  uploadInstructionMessage,
  uploadPlaceholder,
  dismissModal,
  onUpload,
  disabled = true,
  validateFileUpload,
}) {
  const { t } = useTranslation();

  return (
    <Modal dismissModal={dismissModal}>
      <div className={styles.container}>
        <Semibold className={styles.title}>{title}</Semibold>
        <Label>
          <Underlined>{uploadLinkMessage}</Underlined>&nbsp;{uploadInstructionMessage}
        </Label>
        <Form
          onSubmit={onUpload}
          buttonGroup={
            <>
              {onUpload && (
                <Button type={'submit'} disabled={disabled} sm onClick={dismissModal}>
                  {t('common:UPLOAD')}
                </Button>
              )}
            </>
          }
        >
          <Input
            label={uploadPlaceholder}
            type="file"
            accept=".xls,.xlsx"
            onChange={validateFileUpload}
          />
        </Form>
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
  validateFileUpload: PropTypes.func,
};
