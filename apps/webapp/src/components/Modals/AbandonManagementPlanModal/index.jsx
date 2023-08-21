import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
import { Label } from '../../Typography';
import { colors } from '../../../assets/theme';

export default function AbandonManagementPlanModal({ dismissModal, onAbandon }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('MANAGEMENT_PLAN.ABANDON_MANAGEMENT_PLAN_TITLE')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color={'secondary'} sm>
            {t('common:CANCEL')}
          </Button>
          <Button onClick={onAbandon} sm>
            {t('common:ABANDON')}
          </Button>
        </>
      }
      contents={[t('MANAGEMENT_PLAN.ABANDON_MANAGEMENT_PLAN_CONTENT')]}
    >
      <Label
        style={{
          color: colors.grey600,
          paddingTop: '16px',
        }}
      >
        {t('MANAGEMENT_PLAN.DO_YOU_WANT_TO_ABANDON_CONTENT')}
      </Label>
    </ModalComponent>
  );
}
