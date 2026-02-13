/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { Snackbar, Slide } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';
import { useIsOffline } from '../hooks/useOfflineDetector/useIsOffline';
import { useOfflineReadiness } from '../../hooks/useOfflineReadiness/useOfflineReadiness';
import { setRecoveryMode } from '../../hooks/useOfflineReadiness/offlineReadinessSlice';
import styles from './styles.module.scss';
import Badge from '../../components/Badge';

function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}

const OfflineIndicator = () => {
  const dispatch = useDispatch();
  const offline = useIsOffline();
  const { isReadyForOffline, wentOfflineDuringSetup, isServiceWorkerSupported, recoveryMode } =
    useOfflineReadiness();
  const { t } = useTranslation();

  const handleReload = () => {
    window.location.reload();
  };

  const handleReset = async () => {
    if (navigator.serviceWorker) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    if (window.caches) {
      const keys = await window.caches.keys();
      for (const key of keys) {
        await window.caches.delete(key);
      }
    }
    dispatch(setRecoveryMode(false));
    window.location.reload();
  };

  // Show reload button if user went offline during setup and has now reconnected
  // Only relevant if we are in a supported environment (PWA mode).
  const showReloadToResume =
    isServiceWorkerSupported && !offline && wentOfflineDuringSetup && !isReadyForOffline;

  // Show warning if offline and not ready (only if supported/PWA)
  const showWarning = offline && !isReadyForOffline && isServiceWorkerSupported;

  // Show reset button when cache is in unrecoverable state (completely dropped)
  // This occurs when validation detects an empty cache despite having an active SW
  const showReset = showReloadToResume && recoveryMode;

  const isOpen = offline || showReloadToResume;

  if (!isOpen) {
    return null;
  }

  return (
    <Snackbar
      open={isOpen}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={TransitionDown}
      classes={{ root: styles.snackbarRoot }}
    >
      <div className={clsx(styles.offlineIndicator, showWarning && styles.notReady)}>
        {showWarning && <span className={styles.message}>{t('OFFLINE.NOT_READY_WARNING')}</span>}
        {offline && (isReadyForOffline || !isServiceWorkerSupported) && (
          <>
            <span className={styles.message}>
              <span>{t('OFFLINE.ARE_OFFLINE')}</span>
              <span className={styles.additionalText}> {t('OFFLINE.CHANGES_WILL_SYNC')}</span>
            </span>
            <Badge
              title={t('OFFLINE.BADGE.TITLE')}
              content={
                <Trans i18nKey="OFFLINE.BADGE.TOOLTIP_CONTENT" components={{ br: <br /> }} />
              }
              classes={{ iconButton: styles.badge, focus: styles.active }}
            />
          </>
        )}
        {showReloadToResume && (
          <>
            <span className={styles.message}>
              {showReset
                ? t('OFFLINE.OFFLINE_STORAGE_UNAVAILABLE')
                : t('OFFLINE.RELOAD_TO_RESUME_MESSAGE')}
            </span>
            {showReset ? (
              <button type="button" className={styles.reloadButton} onClick={handleReset}>
                {t('OFFLINE.RESET_APPLICATION')}
              </button>
            ) : (
              <button type="button" className={styles.reloadButton} onClick={handleReload}>
                {t('OFFLINE.RELOAD_NOW')}
              </button>
            )}
          </>
        )}
      </div>
    </Snackbar>
  );
};

export default OfflineIndicator;
