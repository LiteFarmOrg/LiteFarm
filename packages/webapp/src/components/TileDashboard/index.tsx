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

import { ReactNode, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ClickAwayListener } from '@mui/material';
import styles from './styles.module.scss';
import { Title } from '../Typography';
import { SummaryTiles } from './SummaryTiles';
import { DashboardTile } from './DashboardTile';
import { ReactComponent as ChevronDown } from '../../assets/images/animals/chevron-down.svg';
import TextButton from '../Form/Button/TextButton';
import { useDynamicTileVisibility } from './useDynamicTileVisibility';

export interface IconCountTile {
  label: string;
  count: number;
  icon: ReactNode;
  onClick: () => void;
}

interface PureTileDashboardProps {
  countTiles: IconCountTile[];
  dashboardTitle: string;
  categoryLabel: string;
}

export const PureTileDashboard = ({
  countTiles,
  dashboardTitle,
  categoryLabel,
}: PureTileDashboardProps) => {
  const totalCount = countTiles.reduce((sum, element) => sum + element.count, 0);
  const categoryCount = countTiles.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const { visibleIconTiles, hiddenIconTiles } = useDynamicTileVisibility({
    containerRef,
    countTiles,
  });

  return (
    <>
      <div className={styles.container}>
        <Title className={styles.title}>{dashboardTitle}</Title>
        <div className={styles.mainContent}>
          <SummaryTiles
            totalCount={totalCount}
            categoryCount={categoryCount}
            categoryLabel={categoryLabel}
          />
          <div className={styles.gridContainer} ref={containerRef}>
            {visibleIconTiles.map((item, index) => (
              <div key={index} className={clsx(styles.gridItem)}>
                <DashboardTile key={index} {...item} />
              </div>
            ))}
            {hiddenIconTiles.length ? <MoreComponent moreIconTiles={hiddenIconTiles} /> : <></>}
          </div>
        </div>
      </div>
    </>
  );
};

interface MoreComponentProps {
  moreIconTiles: IconCountTile[];
}

const MoreComponent = ({ moreIconTiles }: MoreComponentProps) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={clsx(styles.moreContainer, styles.gridItem)}>
      <TextButton className={clsx(styles.moreButton)} onClick={() => setIsOpen((prev) => !prev)}>
        <span>{t('TABLE.NUMBER_MORE', { number: moreIconTiles.length })} </span>
        <ChevronDown />
      </TextButton>
      {isOpen && (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
          <div className={styles.moreContent}>
            {moreIconTiles.map((item, index) => (
              <div key={index} className={clsx(styles.contentItem)}>
                <DashboardTile key={index} {...item} />
              </div>
            ))}
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
};
