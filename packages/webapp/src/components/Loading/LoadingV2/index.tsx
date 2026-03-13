import { useEffect, useRef, useState } from 'react';
import Spinner from './Spinner';
import styles from './styles.module.scss';
import { Backdrop } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function LoadingSpinner() {
  const { t } = useTranslation();
  return (
    <div className={styles.loadingSpinner}>
      <Spinner size={48} />
      <span className={styles.loadingText}>{t('common:LOADING')}</span>
    </div>
  );
}

export function LoadingDialog({ dataName }: { dataName: string }) {
  const { t } = useTranslation();
  return (
    <div className={styles.loadingDialog}>
      <LoadingSpinner />
      <span className={styles.sitBackText}>{t('common:FETCHING_YOUR_DATA', { dataName })}</span>
    </div>
  );
}

interface LoadingBackdropProps {
  isOpen: boolean;
  isCompactSideMenu: boolean;
  showDelay?: number;
  hideDelay?: number;
  dataName: string;
}

export function LoadingBackdrop({
  isOpen,
  isCompactSideMenu,
  showDelay = 200,
  hideDelay = 100,
  dataName,
}: LoadingBackdropProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isOpen) {
      timerRef.current = setTimeout(() => setIsVisible(true), showDelay);
    } else {
      timerRef.current = setTimeout(() => setIsVisible(false), hideDelay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, showDelay, hideDelay]);

  const customStyles = isCompactSideMenu
    ? {
        width: 'calc(100vw + var(--global-compact-side-menu-width))',
      }
    : {
        width: 'calc(100vw + var(--global-side-menu-width))',
      };

  return (
    <Backdrop
      open={isVisible}
      sx={{
        ...customStyles,
        top: 'var(--global-navbar-height)',
        zIndex: (theme: any) => theme.zIndex.appBar + 2,
        backgroundColor: 'rgba(246, 251, 250, 0.80)',
        pointerEvents: 'none', // ← remove if you want to block clicks
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LoadingDialog dataName={dataName} />
    </Backdrop>
  );
}
