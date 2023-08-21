import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

export function NoCropManagementPlanModal({ dismissModal, goToCatalogue }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      title={t('ADD_TASK.NO_MANAGEMENT_PLAN')}
      contents={[t('ADD_TASK.NEED_MANAGEMENT_PLAN')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button
            data-cy="tasks-noCropPlanCancel"
            className={styles.button}
            onClick={dismissModal}
            color={'secondary'}
            type={'button'}
            sm
          >
            {t('common:CANCEL')}
          </Button>
          <Button data-cy="tasks-noCropPlanContinue" onClick={goToCatalogue} type={'submit'} sm>
            {t('ADD_TASK.GO_TO_CATALOGUE')}
          </Button>
        </>
      }
    ></ModalComponent>
  );
}
