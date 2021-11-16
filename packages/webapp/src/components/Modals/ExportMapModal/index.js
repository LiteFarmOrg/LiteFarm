import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../';
import { ReactComponent as DownloadIcon } from '../../../assets/images/map/download.svg';
import { AiOutlineMail } from 'react-icons/all';
import styles from './styles.module.scss';
import { Main, Title } from '../../Typography';
import Button from '../../Form/Button';

export function PureExportMapModal({
  onClickDownload: download,
  onClickShare: share,
  dismissModal,
}) {
  const { t } = useTranslation();
  const [isEmailing, setEmailing] = useState();
  const onClickEmail = () => {
    share();
    setEmailing(true);
  };
  useEffect(() => {
    let timer;
    if (isEmailing) {
      timer = setTimeout(() => {
        if (isEmailing) {
          setEmailing(false);
          dismissModal();
        }
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isEmailing]);

  const onClickDownload = () => {
    download();
    dismissModal();
  };

  return (
    <div className={styles.container}>
      <Title>{t('FARM_MAP.EXPORT_MODAL.TITLE')}</Title>
      <Main>{t('FARM_MAP.EXPORT_MODAL.BODY')}</Main>
      <Button color="secondary" className={styles.button} onClick={onClickDownload}>
        <DownloadIcon className={styles.downloadSvg} />
        <div>{t('FARM_MAP.EXPORT_MODAL.DOWNLOAD')}</div>
      </Button>
      <Button
        color="secondary"
        disabled={isEmailing}
        className={styles.button}
        onClick={onClickEmail}
      >
        <AiOutlineMail className={styles.mailSvg} />
        <div>
          {isEmailing
            ? `${t('FARM_MAP.EXPORT_MODAL.EMAILING')}...`
            : t('FARM_MAP.EXPORT_MODAL.EMAIL_TO_ME')}
        </div>
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
