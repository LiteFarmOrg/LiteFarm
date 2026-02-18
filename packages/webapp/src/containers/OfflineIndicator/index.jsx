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
import { ReactComponent as RefreshIcon } from '../../assets/images/refresh-cw.svg';

function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}

const OfflineIndicator = () => {
  const offline = useIsOffline();
  const {
    isServiceWorkerSupported,
    isReadyForOffline,
    wentOfflineDuringSetup,
    recoveryMode,
    reloadApp,
    resetApplication,
  } = useOfflineReadiness();
  const { t } = useTranslation();

  const showRefresh =
    isServiceWorkerSupported && !offline && wentOfflineDuringSetup && !isReadyForOffline;
  const showWarning = offline && !isReadyForOffline && isServiceWorkerSupported;
  const showReset = showRefresh && recoveryMode;

  const isIndicatorOpen = offline || showRefresh;

  return (
    <Snackbar
      open={isIndicatorOpen}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={TransitionDown}
      classes={{ root: styles.snackbarRoot }}
    >
      <div
        className={clsx(
          styles.offlineIndicator,
          showWarning && styles.notReady,
          showRefresh && styles.prepareOffline,
        )}
      >
        {showWarning && (
          <>
            <span className={styles.message}>{t('OFFLINE.NOT_READY_WARNING')}</span>
            <Badge
              title={t('OFFLINE.NOT_READY_BADGE.TITLE')}
              content={
                <Trans
                  i18nKey="OFFLINE.NOT_READY_BADGE.TOOLTIP_CONTENT"
                  components={{ br: <br /> }}
                />
              }
              classes={{
                iconButton: clsx(styles.badge, styles.warningBadge),
              }}
            />
          </>
        )}
        {showRefresh && (
          <>
            <span className={styles.message}>{t('OFFLINE.PREPARE_TO_WORK_OFFLINE')}</span>
            <button
              type="button"
              className={styles.refreshButton}
              onClick={showReset ? resetApplication : reloadApp}
            >
              <RefreshIcon />
              {t('OFFLINE.REFRESH')}
            </button>
          </>
        )}
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
              classes={{
                iconButton: clsx(styles.badge, styles.offlineBadge),
                focus: styles.offlineActive,
              }}
            />
          </>
        )}
      </div>
    </Snackbar>
  );
};

export default OfflineIndicator;
