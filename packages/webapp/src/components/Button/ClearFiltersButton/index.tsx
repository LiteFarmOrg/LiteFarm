/*
 *  Copyright 2024 LiteFarm.org
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
import TextButton from '../../Form/Button/TextButton';
import { ReactComponent as ClearFilterIcon } from '../../../assets/images/clear-filters.svg';
import styles from './styles.module.scss';

export enum ClearFiltersButtonType {
  ICON = 'icon',
  TEXT = 'text',
}

export type ClearFiltersButtonProps = {
  type: ClearFiltersButtonType;
  onClick: () => void;
  isFilterActive: boolean;
};

const ClearFiltersButton = ({ type, onClick, isFilterActive }: ClearFiltersButtonProps) => {
  const { t } = useTranslation();
  const isIconType = type === ClearFiltersButtonType.ICON;

  if (!isFilterActive) {
    return null;
  }

  return (
    <TextButton onClick={onClick}>
      <span className={isIconType ? styles.iconButton : styles.textButton}>
        <ClearFilterIcon />
        {isIconType ? null : (
          <span className={styles.text}>{t('common:CLEAR_ACTIVE_FILTERS')}</span>
        )}
      </span>
    </TextButton>
  );
};

export default ClearFiltersButton;
