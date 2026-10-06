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

interface FarmImageWidgetProps {
  first_name?: string;
  farmName?: string;
  date?: string;
  imgUrl?: string;
}

export default function FarmImageWidget({
  first_name,
  farmName,
  date,
  imgUrl,
}: FarmImageWidgetProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <img className={styles.image} src={imgUrl} alt="" />
      <header className={styles.header}>
        <h1 className={styles.greeting}>
          {t('HOME.GREETING')}
          {first_name}
        </h1>
        <p className={styles.subtitle}>{`${farmName} - ${date}`}</p>
      </header>
    </div>
  );
}
