import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

export function NoSoilSampleLocationsModal({ dismissModal, goToMap }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      title={t('ADD_TASK.NO_SOIL_SAMPLE_LOCATION')}
      contents={[t('ADD_TASK.NEED_SOIL_SAMPLE_LOCATION')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button
            data-cy="tasks-noSoilSampleLocationCancel"
            className={styles.button}
            onClick={dismissModal}
            color={'secondary'}
            type={'button'}
            sm
          >
            {t('common:CANCEL')}
          </Button>
          <Button data-cy="tasks-noSoilSampleLocationContinue" onClick={goToMap} type={'submit'} sm>
            {t('LOCATION_CREATION.CREATE_BUTTON')}
          </Button>
        </>
      }
    ></ModalComponent>
  );
}
