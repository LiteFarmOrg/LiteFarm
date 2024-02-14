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
import styles from './styles.module.scss';
import { Title } from '../Typography';
import { SummaryTiles } from './SummaryTiles';
import { DashboardTile } from './DashboardTile';
import { ReactComponent as ChevronDown } from '../../assets/images/animals/chevron-down.svg';
import TextButton from '../Form/Button/TextButton';
import { useDynamicTileVisibility } from './useDynamicTileVisibility';

export interface KPI {
  label: string;
  count: number;
  icon: ReactNode;
  onClick: () => void;
}

interface PureKPIDashboardProps {
  KPIs: KPI[];
  dashboardTitle: string;
  categoryLabel: string;
}

export const PureKPIDashboard = ({
  KPIs,
  dashboardTitle,
  categoryLabel,
}: PureKPIDashboardProps) => {
  const totalCount = KPIs.reduce((sum, element) => sum + element.count, 0);
  const categoryCount = KPIs.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const threshold = useDynamicTileVisibility({
    containerRef,
    gap: 4,
    tileWidth: 90,
    moreButtonWidth: 90,
    minWidthDesktop: 600, // from inspection
    totalTiles: KPIs.length,
    rowsPerView: {
      desktop: 1,
      mobile: 2,
    },
  });

  const visibleKPIs = KPIs.slice(0, KPIs.length - threshold);
  const hiddenKPIs = KPIs.slice(KPIs.length - threshold);

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
            {visibleKPIs.map((item, index) => (
              <div key={index} className={clsx(styles.gridItem)}>
                <DashboardTile key={index} {...item} />
              </div>
            ))}
            {hiddenKPIs.length ? <MoreComponent moreKPIs={hiddenKPIs} /> : <></>}
          </div>
        </div>
      </div>
    </>
  );
};

interface MoreComponentProps {
  moreKPIs: KPI[];
}

const MoreComponent = ({ moreKPIs }: MoreComponentProps) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={clsx(styles.moreContainer, styles.gridItem)}>
      <TextButton className={clsx(styles.moreButton)} onClick={() => setIsOpen((prev) => !prev)}>
        <span>{t('TABLE.NUMBER_MORE', { number: moreKPIs.length })} </span>
        <ChevronDown />
      </TextButton>
      {isOpen && ( // TODO: add click away
        <div className={styles.moreContent}>
          {moreKPIs.map((item, index) => (
            <div key={index} className={clsx(styles.contentItem)}>
              <DashboardTile key={index} {...item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
