/*
 *  Copyright 2021-2024 LiteFarm.org
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

import PropTypes from 'prop-types';
import clsx from 'clsx';
import Card from '../../Card';
import { useTranslation } from 'react-i18next';
import Square from '../../Square';
import styles from './styles.module.scss';

export default function CropStatusInfoBox({ status, ...props }) {
  const { t } = useTranslation();

  return (
    <Card color={'info'} className={clsx(styles.container)} {...props}>
      {status && (
        <div className={styles.secondRowContainer}>
          <div className={styles.cropCountContainer}>
            <Square>{status.active}</Square>
            {t('common:ACTIVE')}
          </div>
          <div className={styles.cropCountContainer}>
            <Square color={'planned'}>{status.planned}</Square>
            {t('common:PLANNED')}
          </div>
          <div className={styles.cropCountContainer}>
            <Square color={'past'}>{status.completed + status.abandoned}</Square>
            {t('common:PAST')}
          </div>
          <div className={styles.cropCountContainer}>
            <Square color={'needsPlan'}>{status.noPlans}</Square>
            {t('common:NEEDS_PLAN')}
          </div>
        </div>
      )}
    </Card>
  );
}

CropStatusInfoBox.propTypes = {
  status: PropTypes.exact({
    active: PropTypes.number,
    abandoned: PropTypes.number,
    planned: PropTypes.number,
    completed: PropTypes.number,
    noPlans: PropTypes.number,
  }),
};
