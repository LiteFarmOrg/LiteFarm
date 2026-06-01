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
}

const EntityProfitTable = ({
  rows,
  entityTab,
  onTabChange,
  currencySymbol,
}: EntityProfitTableProps) => {
  const { t } = useTranslation('profitability');

  const formatCurrency = (value: number): string =>
    `${currencySymbol}${Math.abs(value).toFixed(2)}`;

  const firstColumnLabel = (): string => {
    if (entityTab === EntityTab.CROPS) {
      return t('TABLE.VARIETY');
    }
    return t('TABLE.ANIMAL');
  };

  const renderLabel = (row: EntityProfitTableRow): ReactNode => {
    return <span className={clsx(row.isTotal && styles.cellTotal)}>{row.label}</span>;
  };

  const renderRevenue = (row: EntityProfitTableRow): ReactNode => {
    return (
      <span className={clsx(styles.cellRevenue, row.isTotal && styles.cellTotal)}>
        {formatCurrency(row.revenue)}
      </span>
    );
  };

  const renderExpense = (row: EntityProfitTableRow): ReactNode => {
    return (
      <span className={clsx(styles.cellExpense, row.isTotal && styles.cellTotal)}>
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

  return (
    <div className={styles.entityProfitTable}>
      <StateTab
        variant={Variant.UNDERLINE}
        tabs={tabs}
        state={entityTab}
        setState={(key) => onTabChange(key as EntityTab)}
      />
      <Table
        kind={TableKind.V2}
        columns={columns}
        data={rows}
        alternatingRowColor
        shouldFixTableLayout
        headerClass={styles.profitabilityTableHeader}
      />
    </div>
  );
};

export default EntityProfitTable;
