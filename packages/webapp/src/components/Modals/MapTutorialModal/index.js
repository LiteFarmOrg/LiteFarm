import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../';
import styles from './styles.module.scss';
import { Main, Title } from '../../Typography';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';

export default function MapTutorialModal({
  title,
  steps,
  dismissModal,
  children,
}) {
  const { t } = useTranslation();

  return (
    <Modal dismissModal={dismissModal}>
      <div className={styles.container}>
        <Title className={styles.title}>{title}</Title>
        {steps?.length && (
          <ol className={styles.stepList}>
            {steps.map((step) => <li className={styles.stepListItem}>{step}</li>)}
          </ol>
        )}
        {children}
        <Button color="primary" className={styles.button} onClick={dismissModal} sm>
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
};
