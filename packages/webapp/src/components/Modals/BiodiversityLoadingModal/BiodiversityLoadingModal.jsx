import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { ReactComponent as HazardIcon } from '../../../assets/images/warning.svg';

const BiodiversityLoadingModal = ({ dismissModal, loadingError, minutes }) => {
  const { t } = useTranslation();
  return loadingError ? (
    <ModalComponent
      title={t('INSIGHTS.BIODIVERSITY.ERROR.TITLE')}
      contents={[t('INSIGHTS.BIODIVERSITY.ERROR.BODY', { minutes })]}
      dismissModal={dismissModal}
      icon={HazardIcon}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={dismissModal} sm>
            {t('common:OK')}
          </Button>
        </>
      }
      error
    />
  ) : (
    <ModalComponent
      title={t('INSIGHTS.BIODIVERSITY.LOADING.TITLE')}
      contents={[t('INSIGHTS.BIODIVERSITY.LOADING.BODY')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={dismissModal} sm>
            {t('common:CANCEL')}
          </Button>
        </>
      }
    />
  );
};

export default BiodiversityLoadingModal;
