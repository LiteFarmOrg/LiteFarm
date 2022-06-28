import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
import { Label } from '../../Typography';
import { colors } from '../../../assets/theme';

export default function UpdateSensorModal({ dismissModal, onChange }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('SENSOR.MODAL.TITLE')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color={'secondary'} sm>
            {t('common:CANCEL')}
          </Button>
          <Button onClick={onChange} sm>
            {t('common:CHANGE')}
          </Button>
        </>
      }
      contents={[t('SENSOR.MODAL.BODY')]}
    >
      {/* <Label
        style={{
          color: colors.grey600,
          paddingTop: '16px',
        }}
      >
        {t('MANAGEMENT_PLAN.DO_YOU_WANT_TO_ABANDON_CONTENT')}
      </Label> */}
    </ModalComponent>
  );
}
