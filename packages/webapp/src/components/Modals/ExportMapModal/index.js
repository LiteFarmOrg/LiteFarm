import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalComponent, Modal } from '../';
import { ReactComponent as DownloadIcon } from '../../../assets/images/map/download.svg';
import { ReactComponent as ShareIcon } from '../../../assets/images/map/share.svg';
import styles from './styles.module.scss';
import { Main, Title } from '../../Typography';
import Button from '../../Form/Button';

export function PureExportMapModal({ onClickDownload, onClickShare }) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Title>
        {t('FARM_MAP.EXPORT_MODAL.TITLE')}
      </Title>
      <Main>{t('FARM_MAP.EXPORT_MODAL.BODY')}</Main>
      <Button color='secondary' className={styles.button} onClick={onClickDownload}>
        <DownloadIcon className={styles.svg} />
        <div>{t('FARM_MAP.EXPORT_MODAL.DOWNLOAD')}</div>
      </Button>
      <Button color='secondary' className={styles.button} onClick={onClickShare}>
        <ShareIcon className={styles.svg} />
        <div>{t('FARM_MAP.EXPORT_MODAL.SHARE')}</div>
      </Button>
    </div>
  );
}

export default function ExportMapModal({ onClickDownload, onClickShare, dismissModal }) {
  return (
    <Modal dismissModal={dismissModal}>
      <PureExportMapModal
        onClickDownload={onClickDownload}
        onClickShare={onClickShare}
        dismissModal={dismissModal}
      />
    </Modal>
  );
}
