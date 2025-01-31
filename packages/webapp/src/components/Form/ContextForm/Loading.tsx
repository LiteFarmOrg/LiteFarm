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

import { useTranslation } from 'react-i18next';
import Spinner from '../../Spinner';
import styles from './styles.module.scss';

interface LoadingProps {
  dataName?: string;
}

const Loading = ({ dataName = '' }: LoadingProps) => {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <div className={styles.loadingScreen}>
      <div>
        <Spinner />
      </div>
      <div className={styles.loadingText}>{t('common:LOADING')}</div>
      <div className={styles.loadingMessage}>{t('common:FETCHING_YOUR_DATA', { dataName })}</div>
    </div>
  );
};

export default Loading;
