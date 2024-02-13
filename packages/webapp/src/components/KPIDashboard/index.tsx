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

import { ReactNode, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { Title } from '../Typography';
import { SummaryTiles } from './SummaryTiles';
import { KPITile } from './KPITile';
import { ReactComponent as ChevronDown } from '../../assets/images/animals/chevron-down.svg';
import TextButton from '../Form/Button/TextButton';

// Source: https://github.com/que-etc/resize-observer-polyfill
interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const totalCount = KPIs.reduce((sum, element) => sum + element.count, 0);
  const categoryCount = KPIs.length;

  const [KPIBreakpoint, setKPIBreakpoint] = useState(0);
  const visibleKPIs = KPIs.slice(0, KPIs.length - KPIBreakpoint);
  const hiddenKPIs = KPIs.slice(KPIs.length - KPIBreakpoint);
  const containerRef = useRef<HTMLDivElement>(null);

  let tileWidths: number[] = [];
  const GAP = 4; // flex-gap

  useLayoutEffect(() => {
    let resizeObserver: ResizeObserver;

    const getDimensions = (container: HTMLElement) => {
      if (container) {
        const containerRect = container.getBoundingClientRect();

        // One row on desktop; two on mobile
        const isSingleRow = containerRect.width > 600;
        console.log({ isSingleRow });

        const tiles = Array.from(container.children);
        let totalWidth = 0;
        let willFit = 0;

        if (!tileWidths.length) {
          tileWidths = Array.from(tiles).map((tile, index) => {
            const tileRect = tile.getBoundingClientRect();

            return tileRect.width + (index > 0 ? GAP : 0);
          });
        }

        const rowMultiplier = isSingleRow ? 1 : 2;

        tileWidths.forEach((width) => {
          if (totalWidth > containerRect.width * rowMultiplier) {
            return;
          } else {
            totalWidth += width;
            willFit++;
          }
        });

        let breakpoint = KPIs.length - willFit + rowMultiplier;

        setKPIBreakpoint(breakpoint === 1 ? 2 : breakpoint);
      }
    };

    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        getDimensions(containerRef.current!);
      });

      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  useLayoutEffect(() => {
    // Reset when the flex behaviour changes
    setKPIBreakpoint(0);
  }, [isDesktop]);

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
                <KPITile key={index} {...item} />
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
              <KPITile key={index} {...item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
