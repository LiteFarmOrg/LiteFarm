/*
 *  Copyright 2025 LiteFarm.org
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

import { Trans, TFunction } from 'react-i18next';
import { Link } from 'react-router-dom';
import Icon from '../Icons';
import styles from './styles.module.scss';

export default function ManageESciSection({ t }: { t: TFunction }) {
  return (
    <div className={styles.manageEsci}>
      <div className={styles.manageText}>
        <Trans
          i18nKey={'SENSOR.ESCI.TO_MANAGE_SENSORS'}
          shouldUnescape={true}
          tOptions={{ url: 'https://app.esci.io/' }}
        />
      </div>
      <div className={styles.manageLink}>
        <Link to={{ pathname: '/farm', hash: '#esci-addon' }}>
          <Icon iconName="EXTERNAL_LINK" className={styles.externalLinkIcon} />
          <span>{t('SENSOR.ESCI.MANAGE_LINK')}</span>
        </Link>
      </div>
    </div>
  );
}
