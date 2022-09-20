import React from 'react';
import PropTypes from 'prop-types';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';
import { buttonStatusEnum } from './constants';

/**
 * The component is used as a modal to show if there is a mismatch between the selection of crop type (i.e organic/ non-organic)
 * and selected area types.
 *
 * Type can be organic, non-organic, and transitioning
 */
const OrganicStatusMismatchModal = ({ modalContent, dismissModal }) => {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={modalContent?.title ?? ''}
      contents={[modalContent?.subTitle ?? '']}
      dismissModal={() => dismissModal(0)}
      buttonGroup={
        <>
          <Button
            className={styles.button}
            color={'secondary'}
            onClick={() => dismissModal(buttonStatusEnum.THATS_FINE)}
            type={'submit'}
            sm
          >
            {t('common:THATS_FINE')}
          </Button>
          <Button
            className={styles.button}
            onClick={() => dismissModal(buttonStatusEnum.GO_BACK)}
            type={'submit'}
            sm
          >
            {t('common:GO_BACK')}
          </Button>
        </>
      }
    />
  );
};

OrganicStatusMismatchModal.propTypes = {
  modalContent: PropTypes.object.isRequired,
  dismissModal: PropTypes.func.isRequired,
};

export default OrganicStatusMismatchModal;
