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

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ClickAwayListener } from '@mui/material';
import styles from './styles.module.scss';
import { DashboardTile } from '../DashboardTile';
import { ReactComponent as ChevronDown } from '../../../assets/images/animals/chevron-down.svg';
import TextButton from '../../Form/Button/TextButton';
import { TypeCountTile, FilterId } from '..';

interface MoreComponentProps {
  moreIconTiles: TypeCountTile[];
  selectedFilterIds?: FilterId[];
  className?: string;
}

export const MoreComponent = ({
  moreIconTiles,
  selectedFilterIds,
  className = '',
}: MoreComponentProps) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  // Selected state for the more button
  const atLeastOneSelected = moreIconTiles.some((item) => selectedFilterIds?.includes(item.id));

  return (
    <div className={clsx(styles.moreContainer, className)}>
      <TextButton
        className={clsx(
          styles.moreButton,
          atLeastOneSelected && styles.selected,
          isOpen && styles.open,
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{t('TABLE.NUMBER_MORE', { number: moreIconTiles.length })} </span>
        <ChevronDown />
      </TextButton>
      {isOpen && (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
          <div className={styles.moreContent}>
            {moreIconTiles.map((item, index) => (
              <div key={index} className={clsx(styles.contentItem)}>
                <DashboardTile
                  key={index}
                  {...item}
                  isSelected={selectedFilterIds?.includes(item.id)}
                />
              </div>
            ))}
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
};
