/*
 *  Copyright 2026 LiteFarm.org
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
import StateTab from '../RouterTab/StateTab';
import { Variant } from '../RouterTab/Tab';
import ExpandableSection from './ExpandableSection';
import { EntityTab } from './constants';
import styles from './styles.module.scss';

const PLACEHOLDER_BAR_COUNT = 3;
const PLACEHOLDER_TABLE_ROW_COUNT = 5;

export interface ProfitabilityWidgetSkeletonProps {
  omitHeader?: boolean;
}

const PlaceholderBarRow = () => (
  <div className={styles.skeletonBarRow}>
    <div className={styles.skeletonBarRowHeader}>
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonBarLabel)} />
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonBarValue)} />
    </div>
    <div className={styles.skeletonBarTrack} />
  </div>
);

const PlaceholderTableRow = () => (
  <div className={styles.skeletonTableRow}>
    <div className={styles.skeletonTableCell}>
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonCellLabel)} />
    </div>
    <div className={clsx(styles.skeletonTableCell, styles.skeletonAlignRight)}>
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonCellRevenue)} />
    </div>
    <div className={clsx(styles.skeletonTableCell, styles.skeletonAlignRight)}>
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonCellExpense)} />
    </div>
    <div className={clsx(styles.skeletonTableCell, styles.skeletonAlignRight)}>
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonCellNetProfit)} />
    </div>
  </div>
);

const ProfitabilityWidgetSkeleton = (_props: ProfitabilityWidgetSkeletonProps) => {
  const { t } = useTranslation('profitability');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(EntityTab.CROPS);

  const tabs = [
    { key: EntityTab.CROPS, label: t('TABS.CROPS') },
    { key: EntityTab.ANIMALS, label: t('TABS.ANIMALS') },
    { key: EntityTab.ALL, label: t('TABS.ALL') },
  ];

  return (
    <div className={styles.skeleton} aria-label="Profitability widget empty state">
      {/* KPI Section */}
      <div className={styles.skeletonKpiSection}>
        <div className={clsx(styles.skeletonKpiCard, styles.skeletonKpiHero)}>
          <div>
            <div className={styles.skeletonKpiLabel}>{t('KPI.NET_PROFIT')}</div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
          <div className={styles.skeletonKpiTrend}>
            <span>-%</span>
            <span aria-hidden="true">&rarr;</span>
            <span className={styles.skeletonKpiTrendSuffix}>y/y</span>
          </div>
        </div>

        <div className={styles.skeletonKpiCompactRow}>
          <div className={styles.skeletonKpiCard}>
            <div className={styles.skeletonKpiLabel}>{t('KPI.TOTAL_REVENUE')}</div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
          <div className={styles.skeletonKpiCard}>
            <div className={styles.skeletonKpiLabel}>{t('KPI.TOTAL_EXPENSES')}</div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
          <div className={styles.skeletonKpiCard}>
            <div className={styles.skeletonKpiLabel}>{t('KPI.MARGIN')}</div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
        </div>
      </div>

      {/* Expandable detail section */}
      <ExpandableSection
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
        expandedLabel={t('LESS_DATA')}
        collapsedLabel={t('MORE_DATA')}
      >
        <div className={styles.skeletonExpandedContent}>
          {/* Revenue & Expense bars */}
          <div className={styles.skeletonBarsSection}>
            <div className={styles.skeletonBarsColumn}>
              <div className={styles.barsColumnHeading}>{t('REVENUE_SOURCES')}</div>
              <div className={styles.skeletonBarsGroup}>
                {Array.from({ length: PLACEHOLDER_BAR_COUNT }, (_, i) => (
                  <PlaceholderBarRow key={i} />
                ))}
              </div>
            </div>
            <div className={styles.skeletonBarsColumn}>
              <div className={styles.barsColumnHeading}>{t('TOP_EXPENSE_CATEGORIES')}</div>
              <div className={styles.skeletonBarsGroup}>
                {Array.from({ length: PLACEHOLDER_BAR_COUNT }, (_, i) => (
                  <PlaceholderBarRow key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Entity profit table */}
          <div className={styles.skeletonTableSection}>
            <StateTab
              variant={Variant.UNDERLINE}
              tabs={tabs}
              state={activeTab}
              setState={(key) => setActiveTab(key as EntityTab)}
            />
            <div className={styles.skeletonTableHeader}>
              <div className={styles.skeletonTableHeaderCell}>{t('TABLE.VARIETY')}</div>
              <div className={clsx(styles.skeletonTableHeaderCell, styles.skeletonAlignRight)}>
                {t('TABLE.REVENUE')}
              </div>
              <div className={clsx(styles.skeletonTableHeaderCell, styles.skeletonAlignRight)}>
                {t('TABLE.EXPENSE')}
              </div>
              <div className={clsx(styles.skeletonTableHeaderCell, styles.skeletonAlignRight)}>
                {t('TABLE.NET_PROFIT')}
              </div>
            </div>
            {Array.from({ length: PLACEHOLDER_TABLE_ROW_COUNT }, (_, i) => (
              <PlaceholderTableRow key={i} />
            ))}
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
};

export default ProfitabilityWidgetSkeleton;
