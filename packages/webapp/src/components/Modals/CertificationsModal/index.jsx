import NewFeatureIcon from '../../../assets/images/home/new-feature.svg?react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';

export function CertificationsModal({ dismissModal, handleClickMaybeLater, handleClickYes }) {
  const { t } = useTranslation();

  const [stepTwo, setStepTwo] = useState(false);

  const onClickMaybeLater = () => {
    setStepTwo(true);
    handleClickMaybeLater();
  };

  if (stepTwo)
    return (
      <ModalComponent
        title={t('CERTIFICATIONS_MODAL.STEP_TWO.TITLE')}
        contents={[t('CERTIFICATIONS_MODAL.STEP_TWO.DESCRIPTION')]}
        dismissModal={dismissModal}
        buttonGroup={
          <Button
            style={{ width: '96px', marginRight: '8px' }}
            onClick={dismissModal}
            type={'submit'}
            sm
          >
            {t('common:GOT_IT')}
          </Button>
        }
      />
    );

  return (
    <ModalComponent
      title={t('CERTIFICATIONS_MODAL.STEP_ONE.TITLE')}
      contents={[t('CERTIFICATIONS_MODAL.STEP_ONE.DESCRIPTION')]}
      dismissModal={onClickMaybeLater}
      icon={<NewFeatureIcon />}
      buttonGroup={
        <>
          <Button
            style={{ width: '96px', marginRight: '8px', padding: '0' }}
            onClick={onClickMaybeLater}
            color={'secondary'}
            type={'button'}
            sm
          >
            {t('CERTIFICATIONS_MODAL.MAYBE_LATER')}
          </Button>
          <Button
            style={{ width: '96px', marginRight: '8px' }}
            onClick={handleClickYes}
            type={'submit'}
            sm
          >
            {t('common:YES')}
          </Button>
        </>
      }
    />
  );
}
