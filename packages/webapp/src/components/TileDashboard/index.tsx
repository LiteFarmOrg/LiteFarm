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

import { ReactNode, useRef } from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { Title } from '../Typography';
import { SummaryTiles } from './SummaryTiles';
import { DashboardTile } from './DashboardTile';
import { MoreComponent } from './MoreComponent';
import { useDynamicTileVisibility } from './useDynamicTileVisibility';

export type FilterId = string | number;

export interface IconCountTile {
  label: string;
  count: number;
  icon: ReactNode;
  id: FilterId;
  onClick?: () => void;
  isSelected?: boolean;
}

export interface PureTileDashboardProps {
  countTiles: IconCountTile[];
  dashboardTitle: string;
  categoryLabel: string;
  selectedFilterIds?: FilterId[];
}

export const PureTileDashboard = ({
  countTiles,
  dashboardTitle,
  categoryLabel,
  selectedFilterIds,
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
                <DashboardTile
                  key={index}
                  {...item}
                  isSelected={selectedFilterIds?.includes(item.id)}
                />
              </div>
            ))}
            {hiddenIconTiles.length ? (
              <MoreComponent
                moreIconTiles={hiddenIconTiles}
                selectedFilterIds={selectedFilterIds}
                className={styles.gridItem}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
