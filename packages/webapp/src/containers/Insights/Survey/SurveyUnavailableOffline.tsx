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

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Main } from '../../../components/Typography';
import styles from './styles.module.scss';
import insightStyles from '../styles.module.scss';
import { useIsOffline } from '../../hooks/useOfflineDetector/useIsOffline';

export default function SurveyUnavailableOffline() {
  const { t } = useTranslation();
  const isOffline = useIsOffline();

  useEffect(() => {
    if (!isOffline && navigator.onLine) {
      window.location.reload();
    }
  }, [isOffline]);

  return (
    <div className={insightStyles.insightContainer}>
      <Main className={styles.offlineMessage}>{t('INSIGHTS.TAPE.NOT_AVAILABLE_OFFLINE')}</Main>
    </div>
  );
}
