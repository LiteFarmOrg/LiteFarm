import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalComponent, Modal } from '../';
import { ReactComponent as DownloadIcon } from '../../../assets/images/map/download.svg';
import { ReactComponent as ShareIcon } from '../../../assets/images/map/share.svg';
import styles from './styles.module.scss';
import { Main, Title } from '../../Typography';
import Button from '../../Form/Button';

export function PureExportMapModal({ onClick }) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Title>
        {'Export your farm map'}
      </Title>
      <Main>{'How do you want to export your farm map?'}</Main>
      <Button color='secondary' className={styles.button}>
        <DownloadIcon className={styles.svg} />
        <div>{'Download'}</div>
      </Button>
      <Button color='secondary' className={styles.button}>
        <ShareIcon className={styles.svg} />
        <div>{'Share'}</div>
      </Button>
    </div>
  );
}

export default function ExportMapModal({ onClick, dismissModal }) {
  return (
    <Modal dismissModal={dismissModal}>
      <PureExportMapModal onClick={onClick} dismissModal={dismissModal} />
    </Modal>
  );
}
