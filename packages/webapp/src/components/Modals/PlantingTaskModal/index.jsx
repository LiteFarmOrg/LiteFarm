import React, { useState } from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';
import Checkbox from '../../Form/Checkbox';

export function PlantingTaskModal({ dismissModal, goToCatalogue, updatePlantTaskSpotlight }) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState();
  const onCheckBoxClick = () => setChecked(!checked);
  const onCancel = () => {
    dismissModal();
    checked && updatePlantTaskSpotlight();
  };
  const onAddPlantTask = () => {
    goToCatalogue();
    checked && updatePlantTaskSpotlight();
  };
  return (
    <ModalComponent
      title={t('ADD_TASK.PLANTING_TASK')}
      contents={[t('ADD_TASK.PLANTING_TASK_MODAL')]}
      dismissModal={onCancel}
      buttonGroup={
        <>
          <Button
            data-cy="tasks-plantingModalCancel"
            className={styles.button}
            onClick={onCancel}
            color={'secondary'}
            type={'button'}
            sm
          >
            {t('common:CANCEL')}
          </Button>
          <Button onClick={onAddPlantTask} type={'submit'} sm>
            {t('ADD_TASK.GO_TO_CATALOGUE')}
          </Button>
        </>
      }
    >
      <Checkbox
        data-cy="tasks-plantingModalCheckBox"
        label={t('common:DO_NOT_SHOW')}
        checked={checked}
        sm
        onClick={onCheckBoxClick}
        style={{ marginTop: '26px', marginBottom: '10px' }}
      />
    </ModalComponent>
  );
}
