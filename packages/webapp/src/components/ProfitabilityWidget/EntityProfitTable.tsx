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

import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import clsx from 'clsx';
import StateTab from '../RouterTab/StateTab';
import { Variant } from '../RouterTab/Tab';
import Table from '../Table';
import { TableKind, Alignment, TableV2Column } from '../Table/types';
import { EntityTab } from './constants';
import type { EntityProfitRow } from '../../containers/Home/ProfitabilityWidget/utils';
import styles from './styles.module.scss';

interface EntityProfitTableRow {
  id: string;
  kind: 'crop' | 'animal';
  label: string;
  isTotal?: boolean;
  revenue: number;
  expense: number;
  netProfit: number;
}

export interface EntityProfitTableProps {
  rows: EntityProfitRow[];
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
  const { t } = useTranslation(['profitability', 'animal']);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const displayRows: EntityProfitTableRow[] = useMemo(
    () =>
      rows
        .map((row) => {
          let label = row.label;
          let isTotal = false;
          if (row.kind === 'crop' && row.cropTranslationKey) {
            label = `${row.label}, ${t(`crop:${row.cropTranslationKey}`)}`;
          } else if (row.kind === 'animal' && row.isTotal) {
            isTotal = true;
            const typeName = row.typeTranslationKey
              ? t(`animal:TYPE.${row.typeTranslationKey}`)
              : row.label;
            label = t('TABLE.TYPE_TOTAL', { type: typeName });
          }
          return {
            id: row.id,
            kind: row.kind,
            label,
            isTotal,
            revenue: row.revenue,
            expense: row.expense,
            netProfit: row.netProfit,
          };
        })
        // Sort total rows to the bottom, then alphabetically by label.
        // The desktop table pins totals via pinToBottom; the mobile card
        // list has no such mechanism and depends on this ordering
        .sort((a, b) => {
          if (a.isTotal !== b.isTotal) {
            return a.isTotal ? 1 : -1;
          }
          return a.label.localeCompare(b.label);
        }),
    [rows, t],
  );

  const formatCurrency = (value: number): string =>
    `${currencySymbol}${Math.abs(value).toFixed(2)}`;

  const firstColumnLabel = (): string => {
    if (entityTab === EntityTab.CROPS) {
      return t('TABLE.VARIETY');
    }
    return t('TABLE.ANIMAL');
  };

  const hasNoEntitiesForActiveTab = entityTab === EntityTab.CROPS ? !hasCropVarieties : !hasAnimals;
  const emptyStateMessage =
    entityTab === EntityTab.CROPS ? t('TABLE.NO_CROP_VARIETIES') : t('TABLE.NO_ANIMALS');

  const renderLabel = (row: EntityProfitTableRow): ReactNode => {
    return <span className={clsx(row.isTotal && styles.cellTotal)}>{row.label}</span>;
  };

  const renderCurrencyCell = (value: number, isTotal?: boolean): ReactNode => {
    return (
      <span className={clsx(styles.cellNumeric, isTotal && styles.cellTotal)}>
        {formatCurrency(value)}
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
      format: (row: EntityProfitTableRow) => renderCurrencyCell(row.revenue, row.isTotal),
    },
    {
      id: 'expense',
      label: t('TABLE.EXPENSE'),
      align: Alignment.RIGHT,
      format: (row: EntityProfitTableRow) => renderCurrencyCell(row.expense, row.isTotal),
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

  // Exclude the label column
  const [, ...numericColumns] = columns;

  return (
    <div className={styles.entityProfitTable}>
      <StateTab
        variant={Variant.UNDERLINE}
        tabs={tabs}
        state={entityTab}
        setState={(key) => onTabChange(key as EntityTab)}
      />
      {hasNoEntitiesForActiveTab ? (
        <div className={styles.entityEmptyState}>
          <p className={styles.entityEmptyStateText}>{emptyStateMessage}</p>
        </div>
      ) : isMobile ? (
        <div className={styles.entityCardList}>
          {displayRows.map((row) => (
            <div key={row.id} className={styles.entityCard}>
              <div className={styles.entityCardContent}>
                <div className={styles.entityCardHeader}>{row.label}</div>
                {numericColumns.map((column) => (
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
          data={displayRows}
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
