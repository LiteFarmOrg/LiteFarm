import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../';
import { ReactComponent as DownloadIcon } from '../../../assets/images/map/download.svg';
import { AiOutlineMail } from 'react-icons/all';
import styles from './styles.module.scss';
import { Main, Title } from '../../Typography';
import Button from '../../Form/Button';
import html2canvas from 'html2canvas';

export function PureExportMapModal({
  onClickDownload: download,
  onClickShare: share,
  dismissModal,
  currentMap,
  farmName,
}) {
  const { t } = useTranslation();
  const [isEmailing, setEmailing] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [linkHref, setLinkHref] = useState();
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

  useEffect(() => {
    console.log(currentMap);
    setIsLoading(true);
    html2canvas(currentMap, { useCORS: true }).then((canvas) => {
      setLinkHref(canvas.toDataURL());
      setIsLoading(false);
    });
  }, []);

  const onClickDownload = () => {
    dismissModal();
  };

  return (
    <div className={styles.container}>
      <Title>{t('FARM_MAP.EXPORT_MODAL.TITLE')}</Title>
      <Main>{t('FARM_MAP.EXPORT_MODAL.BODY')}</Main>
      <a href={linkHref} download={`${farmName}-export-${new Date().toISOString()}.png`}>
        <Button
          color="secondary"
          className={styles.button}
          style={{ width: '100%' }}
          onClick={onClickDownload}
        >
          {isLoading ? (
            'Loading...'
          ) : (
            <>
              <DownloadIcon className={styles.downloadSvg} />
              <div>{t('FARM_MAP.EXPORT_MODAL.DOWNLOAD')}</div>
            </>
          )}
        </Button>
      </a>
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

export default function ExportMapModal({ onClickShare, dismissModal, currentMap, farmName }) {
  return (
    <Modal dismissModal={dismissModal}>
      <PureExportMapModal
        onClickShare={onClickShare}
        dismissModal={dismissModal}
        currentMap={currentMap}
        farmName={farmName}
      />
    </Modal>
  );
}
