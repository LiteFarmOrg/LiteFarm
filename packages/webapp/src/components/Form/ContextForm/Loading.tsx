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

import { CSSProperties } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Spinner from '../../Spinner';
import FloatingContainer from '../../FloatingContainer';
import type { CSSLength } from '../../../types';
import styles from './styles.module.scss';

interface LoadingProps {
  dataName?: string;
  isCompactSideMenu: boolean;
  verticalMargin?: CSSLength;
  horizontalMargin?: CSSLength;
  mobileMargin?: CSSLength;
}

const Loading = ({
  dataName = '',
  isCompactSideMenu,
  verticalMargin = '36px',
  horizontalMargin = '64px',
  mobileMargin = '16px',
}: LoadingProps) => {
  const { t } = useTranslation(['translation', 'common']);
  const style = {
    '--vertical-margin': verticalMargin,
    '--horizontal-margin': horizontalMargin,
    '--mobile-margin': mobileMargin,
  } as CSSProperties;

  return (
    <FloatingContainer isCompactSideMenu={isCompactSideMenu} distanceFromBottom={verticalMargin}>
      <div
        className={clsx(
          styles.loadingScreen,
          isCompactSideMenu ? styles.withCompactSideMenu : styles.withExpandedSideMenu,
        )}
        style={style}
      >
        <div>
          <Spinner />
        </div>
        <div className={styles.loadingText}>{t('common:LOADING')}</div>
        <div className={styles.loadingMessage}>{t('common:FETCHING_YOUR_DATA', { dataName })}</div>
      </div>
    </FloatingContainer>
  );
};

export default Loading;
