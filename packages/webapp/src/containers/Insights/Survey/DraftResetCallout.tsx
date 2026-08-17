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

import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export default function DraftResetCallout() {
  const { t } = useTranslation();

  return (
    <div className={styles.draftResetCallout}>
      <h4 className={styles.draftResetCalloutTitle}>{t('INSIGHTS.TAPE.DRAFT_RESET.TITLE')}</h4>
      <p className={styles.draftResetCalloutBody}>{t('INSIGHTS.TAPE.DRAFT_RESET.BODY')}</p>
    </div>
  );
}
