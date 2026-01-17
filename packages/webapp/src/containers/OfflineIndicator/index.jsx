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
import { useIsOffline } from '../hooks/useOfflineDetector/useIsOffline';
import styles from './styles.module.scss';
import Badge from '../../components/Badge';

function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}

const OfflineIndicator = () => {
  const offline = useIsOffline();
  const { t } = useTranslation();

  return (
    <Snackbar
      open={offline}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={TransitionDown}
      classes={{ root: styles.snackbarRoot }}
    >
      <div className={styles.offlineIndicator}>
        <span className={styles.message}>
          <span>{t('OFFLINE.ARE_OFFLINE')}</span>
          <span className={styles.additionalText}> {t('OFFLINE.CHANGES_WILL_SYNC')}</span>
        </span>
        <Badge
          title={t('OFFLINE.BADGE.TITLE')}
          content={<Trans i18nKey="OFFLINE.BADGE.TOOLTIP_CONTENT" components={{ br: <br /> }} />}
          classes={{ iconButton: styles.badge, focus: styles.active }}
        />
      </div>
    </Snackbar>
  );
};

export default OfflineIndicator;
