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

import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export const NewVersionBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  return (
    <span className={clsx(styles.newVersion, className)}>
      {t('INSIGHTS.SURVEY.CARD.NEW_VERSION')}
    </span>
  );
};

export default NewVersionBadge;
