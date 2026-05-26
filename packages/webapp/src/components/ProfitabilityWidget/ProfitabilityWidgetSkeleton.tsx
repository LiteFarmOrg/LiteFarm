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
import clsx from 'clsx';
import ExpandableSection from './ExpandableSection';
import EmptyTransactionsBanner from './EmptyTransactionsBanner';
import styles from './styles.module.scss';

export interface ProfitabilityWidgetSkeletonProps {
  /**
   * When true, omits the top header placeholder. Used by the empty-state
   * branch of the widget, which keeps the live header (title + date-range
   * dropdown) above the skeletoned content so the user can still change the
   * range without leaving the empty view.
   */
  omitHeader?: boolean;
}

const PLACEHOLDER_BAR_COUNT = 3;
const PLACEHOLDER_TABLE_ROW_COUNT = 5;

export interface ProfitabilityWidgetSkeletonProps {
  onAddTransactions?: () => void;
}

const PlaceholderBarRow = ({ omitHeader = false }: ProfitabilityWidgetSkeletonProps) => (
  <div className={styles.skeletonBarRow}>
    <div className={styles.skeletonBarRowHeader}>
      {!omitHeader && <div className={clsx(styles.skeletonPlaceholder, styles.skeletonBarLabel)} />}
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

const ProfitabilityWidgetSkeleton = ({
  onAddTransactions = () => {},
}: ProfitabilityWidgetSkeletonProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={styles.skeleton} aria-label="Profitability widget empty state">
      {/* KPI Section */}
      <div className={styles.skeletonKpiSection}>
        <div className={clsx(styles.skeletonKpiCard, styles.skeletonKpiHero)}>
          <div>
            <div className={styles.skeletonKpiLabel}>Net profit</div>
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
            <div className={styles.skeletonKpiLabel}>Total revenue</div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
          <div className={styles.skeletonKpiCard}>
            <div className={styles.skeletonKpiLabel}>Total expenses</div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
          <div className={styles.skeletonKpiCard}>
            <div className={styles.skeletonKpiLabel}>Margin</div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
        </div>
      </div>

      {/* Expandable detail section */}
      <ExpandableSection
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
        expandedLabel="Less data"
        collapsedLabel="More data"
      >
        <div className={styles.skeletonExpandedContent}>
          {/* Revenue & Expense bars */}
          <div className={styles.skeletonBarsSection}>
            <div className={styles.skeletonBarsColumn}>
              <div className={styles.skeletonBarsHeading}>Revenue sources</div>
              <div className={styles.skeletonBarsGroup}>
                {Array.from({ length: PLACEHOLDER_BAR_COUNT }, (_, i) => (
                  <PlaceholderBarRow key={i} />
                ))}
              </div>
            </div>
            <div className={styles.skeletonBarsColumn}>
              <div className={styles.skeletonBarsHeading}>Expense categories</div>
              <div className={styles.skeletonBarsGroup}>
                {Array.from({ length: PLACEHOLDER_BAR_COUNT }, (_, i) => (
                  <PlaceholderBarRow key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Entity profit table */}
          <div className={styles.skeletonTableSection}>
            <div className={styles.skeletonTabs}>
              <div className={clsx(styles.skeletonTab, styles.skeletonTabActive)}>Crops</div>
              <div className={styles.skeletonTab}>Animals</div>
              <div className={styles.skeletonTab}>All</div>
            </div>
            <div className={styles.skeletonTableHeader}>
              <div className={styles.skeletonTableHeaderCell}>Variety</div>
              <div className={clsx(styles.skeletonTableHeaderCell, styles.skeletonAlignRight)}>
                Revenue
              </div>
              <div className={clsx(styles.skeletonTableHeaderCell, styles.skeletonAlignRight)}>
                Expense
              </div>
              <div className={clsx(styles.skeletonTableHeaderCell, styles.skeletonAlignRight)}>
                Net profit
              </div>
            </div>
            {Array.from({ length: PLACEHOLDER_TABLE_ROW_COUNT }, (_, i) => (
              <PlaceholderTableRow key={i} />
            ))}
          </div>
        </div>
      </ExpandableSection>

      {/* Empty state banner */}
      <EmptyTransactionsBanner
        message="Start recording your revenue and expenses to track profitability across your crops and animals."
        ctaLabel="Add transactions"
        onAddTransactions={onAddTransactions}
      />
    </div>
  );
};

export default ProfitabilityWidgetSkeleton;
