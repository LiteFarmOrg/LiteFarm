import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function RetireCropWarning({ dismissModal, handleRetire }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t('CROP_VARIETIES.RETIRE.RETIRE_CROP_TITLE')}
      contents={[t('CROP_VARIETIES.RETIRE.CONFIRMATION')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button style={{ width: '96px', marginRight: '8px' }} onClick={dismissModal} color={'secondary'} type={'button'} sm>
            {t('common:CANCEL')}
          </Button>
          <Button style={{ width: '96px', marginRight: '8px' }} onClick={handleRetire} type={'submit'} sm>
            {t('common:RETIRE')}
          </Button>
        </>
      }
    />
  )
}
