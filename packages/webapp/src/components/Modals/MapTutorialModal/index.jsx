import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../';
import styles from './styles.module.scss';
import { Title } from '../../Typography';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import clsx from 'clsx';

export default function MapTutorialModal({ title, steps, dismissModal, children, hasNoBullet }) {
  const { t } = useTranslation();

  return (
    <Modal dismissModal={dismissModal}>
      <div className={styles.container}>
        <Title className={styles.title}>{title}</Title>
        {steps?.length && (
          <ol className={clsx(styles.stepList, hasNoBullet && styles.noBullet)}>
            {steps.map((step) => (
              <li key={step} className={styles.stepListItem}>
                {step}
              </li>
            ))}
          </ol>
        )}
        {children}
        <Button
          data-cy="mapTutorial-continue"
          color="primary"
          className={styles.button}
          onClick={dismissModal}
          sm
        >
          <div>{t('common:GOT_IT')}</div>
        </Button>
      </div>
    </Modal>
  );
}

MapTutorialModal.prototype = {
  title: PropTypes.string,
  steps: PropTypes.array,
  dismissModal: PropTypes.func,
  hasNoBullet: PropTypes.bool,
};
