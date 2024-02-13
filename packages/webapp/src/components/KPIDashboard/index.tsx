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

import { ReactNode, useState, useEffect, useLayoutEffect, useCallback } from 'react';
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
import {
  useComponentHeight,
  useComponentWidth,
} from '../../containers/hooks/useComponentWidthHeight';
import Button from '../Form/Button';

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
  const { t } = useTranslation();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const totalCount = KPIs.reduce((sum, element) => sum + element.count, 0);
  const categoryCount = KPIs.length;

  const [KPIBreakpoint, setKPIBreakpoint] = useState(0);
  const visibleKPIs = KPIs.slice(0, KPIs.length - KPIBreakpoint);
  const hiddenKPIs = KPIs.slice(KPIs.length - KPIBreakpoint);

  const { ref, height } = useComponentHeight() as unknown as {
    ref: React.RefObject<HTMLDivElement>;
    height: number;
  }; // ugh. Fix the hook instead
  const { ref: widthRef, width } = useComponentWidth() as unknown as {
    ref: React.RefObject<HTMLDivElement>;
    width: number;
  };
  console.log({ height, width, isDesktop });

  useLayoutEffect(() => {
    setKPIBreakpoint(isDesktop ? 0 : KPIs.length);
  }, [isDesktop]);

  const adjustKPIBreakpoint = useCallback(() => {
    const IDEAL_HEIGHT = isDesktop ? 71 : 100; // 1 row : 2 rows
    console.log({ IDEAL_HEIGHT });
    if (height && height > IDEAL_HEIGHT && KPIBreakpoint < KPIs.length) {
      console.log('incrementing breakpoint');
      setKPIBreakpoint((prevBreakpoint) => prevBreakpoint + 1);
    } else if (height && height < IDEAL_HEIGHT && KPIBreakpoint > 0) {
      console.log('decrementing breakpoint');
      setKPIBreakpoint((prevBreakpoint) => prevBreakpoint - 1);
    }
  }, [isDesktop, height, width]);

  useLayoutEffect(() => {
    adjustKPIBreakpoint();
  }, [height, width]);

  useEffect(() => {
    setTimeout(adjustKPIBreakpoint, 100);
  }, []);

  console.log({ KPIBreakpoint });

  return (
    <>
      <div className={styles.container} ref={widthRef}>
        <Title className={styles.title}>{dashboardTitle}</Title>
        <div className={styles.mainContent} ref={ref}>
          <SummaryTiles
            totalCount={totalCount}
            categoryCount={categoryCount}
            categoryLabel={categoryLabel}
          />
          <div className={styles.gridContainer}>
            {visibleKPIs.map((item, index) => (
              <div key={index} className={clsx(styles.gridItem)}>
                <KPITile key={index} {...item} />
              </div>
            ))}
            {hiddenKPIs.length ? <MoreComponent moreKPIs={hiddenKPIs} width={width} /> : <></>}
          </div>
        </div>
      </div>
    </>
  );
};

interface MoreComponentProps {
  moreKPIs: KPI[];
  width: number;
}

const MoreComponent = ({ moreKPIs, width }: MoreComponentProps) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={clsx(styles.moreContainer, styles.gridItem, width && width > 900 && styles.fixed)}
    >
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
