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

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import clsx from 'clsx';
import StateTab from '../RouterTab/StateTab';
import { Variant } from '../RouterTab/Tab';
import Table from '../Table';
import { TableKind, Alignment, TableV2Column } from '../Table/types';
import { EntityTab } from './constants';
import styles from './styles.module.scss';

export interface EntityProfitTableRow {
  id: string;
  kind: 'crop' | 'animal';
  label: string;
  isTotal?: boolean;
  revenue: number;
  expense: number;
  netProfit: number;
}

export interface EntityProfitTableProps {
  rows: EntityProfitTableRow[];
  entityTab: EntityTab;
  onTabChange: (tab: EntityTab) => void;
  currencySymbol: string;
  hasCropVarieties: boolean;
  hasAnimals: boolean;
}

const EntityProfitTable = ({
  rows,
  entityTab,
  onTabChange,
  currencySymbol,
  hasCropVarieties,
  hasAnimals,
}: EntityProfitTableProps) => {
  const { t } = useTranslation('profitability');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formatCurrency = (value: number): string =>
    `${currencySymbol}${Math.abs(value).toFixed(2)}`;

  const firstColumnLabel = (): string => {
    if (entityTab === EntityTab.CROPS) {
      return t('TABLE.VARIETY');
    }
    return t('TABLE.ANIMAL');
  };

  // Shown when the farm has no entities of the active tab's kind
  const isInventoryEmpty = entityTab === EntityTab.CROPS ? !hasCropVarieties : !hasAnimals;
  const emptyStateMessage =
    entityTab === EntityTab.CROPS ? t('TABLE.NO_CROP_VARIETIES') : t('TABLE.NO_ANIMALS');

  const renderLabel = (row: EntityProfitTableRow): ReactNode => {
    return <span className={clsx(row.isTotal && styles.cellTotal)}>{row.label}</span>;
  };

  const renderRevenue = (row: EntityProfitTableRow): ReactNode => {
    return (
      <span className={clsx(styles.cellNumeric, row.isTotal && styles.cellTotal)}>
        {formatCurrency(row.revenue)}
      </span>
    );
  };

  const renderExpense = (row: EntityProfitTableRow): ReactNode => {
    return (
      <span className={clsx(styles.cellNumeric, row.isTotal && styles.cellTotal)}>
        {formatCurrency(row.expense)}
      </span>
    );
  };

  const renderNetProfit = (row: EntityProfitTableRow): ReactNode => {
    return (
      <span
        className={clsx(styles.cellNetProfit, row.netProfit < 0 && styles.cellNetProfitNegative)}
      >
        {row.netProfit < 0 ? '-' : ''}
        {formatCurrency(row.netProfit)}
      </span>
    );
  };

  const columns: TableV2Column[] = [
    {
      id: 'label',
      label: firstColumnLabel(),
      format: renderLabel,
    },
    {
      id: 'revenue',
      label: t('translation:FINANCES.REVENUE'),
      align: Alignment.RIGHT,
      format: renderRevenue,
    },
    {
      id: 'expense',
      label: t('TABLE.EXPENSE'),
      align: Alignment.RIGHT,
      format: renderExpense,
    },
    {
      id: 'netProfit',
      label: t('NET_PROFIT'),
      align: Alignment.RIGHT,
      format: renderNetProfit,
    },
  ];

  const tabs = [
    { key: EntityTab.CROPS, label: t('translation:FINANCES.TRANSACTION.CROPS') },
    { key: EntityTab.ANIMALS, label: t('translation:FINANCES.TRANSACTION.ANIMALS') },
  ];

  // columns[0] is the entity-name column (the card header); the remaining
  // columns are the Revenue / Expense / Net profit rows shown on each card.
  const [, ...metricColumns] = columns;

  return (
    <div className={styles.entityProfitTable}>
      <StateTab
        variant={Variant.UNDERLINE}
        tabs={tabs}
        state={entityTab}
        setState={(key) => onTabChange(key as EntityTab)}
      />
      {isInventoryEmpty ? (
        <div className={styles.entityEmptyState}>
          <p className={styles.entityEmptyStateText}>{emptyStateMessage}</p>
        </div>
      ) : isMobile ? (
        <div className={styles.entityCardList}>
          {rows.map((row) => (
            <div key={row.id} className={styles.entityCard}>
              <div className={styles.entityCardContent}>
                <div className={styles.entityCardHeader}>{row.label}</div>
                {metricColumns.map((column) => (
                  <div key={column.id} className={styles.entityCardRow}>
                    <span className={styles.entityCardLabel}>{column.label}</span>
                    {column.format?.(row)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table
          kind={TableKind.V2}
          columns={columns}
          data={rows}
          alternatingRowColor
          shouldFixTableLayout
          headerClass={styles.profitabilityTableHeader}
          pinToBottom={(row) => !!row.isTotal}
        />
      )}
      <p className={styles.tableFootnote}>{t('TABLE.FOOTNOTE')}</p>
    </div>
  );
};

export default EntityProfitTable;
