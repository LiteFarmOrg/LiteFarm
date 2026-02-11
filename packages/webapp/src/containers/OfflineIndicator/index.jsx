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
import clsx from 'clsx';
import { useIsOffline } from '../hooks/useOfflineDetector/useIsOffline';
import { useOfflineReadiness } from '../../hooks/useOfflineReadiness/useOfflineReadiness';
import styles from './styles.module.scss';
import Badge from '../../components/Badge';

function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}

const OfflineIndicator = () => {
  const offline = useIsOffline();
  const { isReadyForOffline, wentOfflineDuringSetup, isServiceWorkerSupported } =
    useOfflineReadiness();
  const { t } = useTranslation();

  const handleReload = () => {
    window.location.reload();
  };

  // Show reload button if user went offline during setup and has now reconnected
  // Only relevant if we are in a supported environment (PWA mode).
  const showReloadToResume =
    isServiceWorkerSupported && !offline && wentOfflineDuringSetup && !isReadyForOffline;

  // Show warning if offline and not ready (only if supported/PWA)
  const showWarning = offline && !isReadyForOffline && isServiceWorkerSupported;

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
            <span className={styles.message}>{t('OFFLINE.RELOAD_TO_RESUME_MESSAGE')}</span>
            <button type="button" className={styles.reloadButton} onClick={handleReload}>
              {t('OFFLINE.RELOAD_NOW')}
            </button>
          </>
        )}
      </div>
    </Snackbar>
  );
};

export default OfflineIndicator;
