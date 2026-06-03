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
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import clsx from 'clsx';
import StateTab from '../RouterTab/StateTab';
import { Variant } from '../RouterTab/Tab';
import ExpandableSection from './ExpandableSection';
import { EntityTab } from './constants';
import styles from './styles.module.scss';

const PLACEHOLDER_BAR_COUNT = 3;
const PLACEHOLDER_TABLE_ROW_COUNT = 5;
const PLACEHOLDER_CARD_COUNT = 3; // mobile EntityProfitTable

const PlaceholderBarRow = () => (
  <div className={styles.skeletonBarRow}>
    <div className={styles.skeletonBarRowHeader}>
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonBarLabel)} />
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonBarValue)} />
    </div>
    <div className={styles.skeletonBarTrack} />
  </div>
);

interface NumericColumn {
  label: string;
  className: string;
}

const PlaceholderTableRow = ({ numericColumns }: { numericColumns: NumericColumn[] }) => (
  <div className={styles.skeletonTableRow}>
    <div className={styles.skeletonTableCell}>
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonCellLabel)} />
    </div>
    {numericColumns.map(({ label, className }) => (
      <div key={label} className={clsx(styles.skeletonTableCell, styles.skeletonAlignRight)}>
        <div className={clsx(styles.skeletonPlaceholder, className)} />
      </div>
    ))}
  </div>
);

interface EntityProfitTableSkeletonProps {
  entityTab: EntityTab;
  onTabChange: (tab: EntityTab) => void;
}

export const EntityProfitTableSkeleton = ({
  entityTab,
  onTabChange,
}: EntityProfitTableSkeletonProps) => {
  const { t } = useTranslation('profitability');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const tabs = [
    { key: EntityTab.CROPS, label: t('translation:FINANCES.TRANSACTION.CROPS') },
    { key: EntityTab.ANIMALS, label: t('translation:FINANCES.TRANSACTION.ANIMALS') },
  ];

  const numericColumns: NumericColumn[] = [
    { label: t('translation:FINANCES.REVENUE'), className: styles.skeletonCellRevenue },
    { label: t('TABLE.EXPENSE'), className: styles.skeletonCellExpense },
    { label: t('NET_PROFIT'), className: styles.skeletonCellNetProfit },
  ];

  return (
    <div className={styles.skeletonTableSection}>
      <StateTab
        variant={Variant.UNDERLINE}
        tabs={tabs}
        state={entityTab}
        setState={(key) => onTabChange(key as EntityTab)}
      />
      {isMobile ? (
        <div className={styles.skeletonCardList}>
          {Array.from({ length: PLACEHOLDER_CARD_COUNT }, (_, cardIndex) => (
            <div key={cardIndex} className={styles.entityCard}>
              <div className={styles.entityCardContent}>
                <div className={clsx(styles.skeletonPlaceholder, styles.skeletonCardHeader)} />
                {numericColumns.map(({ label, className }) => (
                  <div key={label} className={styles.entityCardRow}>
                    <span className={styles.entityCardLabel}>{label}</span>
                    <div className={clsx(styles.skeletonPlaceholder, className)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className={styles.skeletonTableHeader}>
            <div className={styles.skeletonTableHeaderCell}>
              {entityTab === EntityTab.CROPS ? t('TABLE.VARIETY') : t('TABLE.ANIMAL')}
            </div>
            {numericColumns.map(({ label }) => (
              <div
                key={label}
                className={clsx(styles.skeletonTableHeaderCell, styles.skeletonAlignRight)}
              >
                {label}
              </div>
            ))}
          </div>
          {Array.from({ length: PLACEHOLDER_TABLE_ROW_COUNT }, (_, i) => (
            <PlaceholderTableRow key={i} numericColumns={numericColumns} />
          ))}
        </>
      )}
    </div>
  );
};

const ProfitabilityWidgetSkeleton = () => {
  const { t } = useTranslation('profitability');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(EntityTab.CROPS);

  return (
    <div className={styles.skeleton} aria-label="Profitability widget empty state">
      {/* KPI Section */}
      <div className={styles.skeletonKpiSection}>
        <div className={clsx(styles.skeletonKpiCard, styles.skeletonKpiHero)}>
          <div>
            <div className={styles.skeletonKpiLabel}>{t('NET_PROFIT')}</div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
          <div className={styles.skeletonKpiTrend}>
            <span>-%</span>
            <span aria-hidden="true">&rarr;</span>
            <span className={styles.skeletonKpiTrendSuffix}>
              <span className={styles.trendSuffixFull}>{t('KPI.YOY_TREND')}</span>
              <span className={styles.trendSuffixShort}>{t('KPI.YOY_TREND_SHORT')}</span>
            </span>
          </div>
        </div>

        <div className={styles.skeletonKpiCompactRow}>
          <div className={styles.skeletonKpiCard}>
            <div className={styles.skeletonKpiLabel}>
              {t('translation:SALE.FINANCES.TOTAL_REVENUE')}
            </div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
          <div className={styles.skeletonKpiCard}>
            <div className={styles.skeletonKpiLabel}>
              {t('translation:SALE.FINANCES.TOTAL_EXPENSES')}
            </div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
          <div className={clsx(styles.skeletonKpiCard, styles.margin)}>
            <div className={styles.skeletonKpiLabel}>{t('KPI.MARGIN')}</div>
            <div className={styles.skeletonKpiValue}>-</div>
          </div>
        </div>
      </div>

      {/* Expandable detail section */}
      <ExpandableSection isExpanded={isExpanded} onToggle={() => setIsExpanded((prev) => !prev)}>
        <div className={styles.skeletonExpandedContent}>
          {/* Revenue & Expense bars */}
          <div className={styles.skeletonBarsSection}>
            <div className={styles.skeletonBarsColumn}>
              <div className={styles.barsColumnHeading}>{t('TOP_REVENUE_CATEGORIES')}</div>
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
          <EntityProfitTableSkeleton entityTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </ExpandableSection>
    </div>
  );
};

export default ProfitabilityWidgetSkeleton;
