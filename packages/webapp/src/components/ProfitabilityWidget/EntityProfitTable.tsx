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
import StateTab from '../RouterTab/StateTab';
import { Variant } from '../RouterTab/Tab';
import Table from '../Table';
import { TableKind, Alignment, TableV2Column } from '../Table/types';
import { EntityTab } from './constants';
import styles from './styles.module.scss';

export interface EntityProfitTableRow {
  id: string;
  kind: 'crop' | 'animal' | 'farm_general';
  label: string;
  revenue: number | null;
  expense: number | null;
  netProfit: number | null;
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
    if (entityTab === EntityTab.ANIMALS) {
      return t('TABLE.ANIMAL');
    }
    return t('TABLE.ENTITY');
  };

  const renderLabel = (row: EntityProfitTableRow): ReactNode => {
    if (row.kind === 'farm_general') {
      return t('TABLE.FARM_GENERAL');
    }
    return row.label;
  };

  const renderRevenue = (row: EntityProfitTableRow): ReactNode => {
    if (row.revenue == null) {
      return '-';
    }
    return <span className={styles.cellRevenue}>{formatCurrency(row.revenue)}</span>;
  };

  const renderExpense = (row: EntityProfitTableRow): ReactNode => {
    if (row.expense == null) {
      return '-';
    }
    return <span className={styles.cellExpense}>{formatCurrency(row.expense)}</span>;
  };

  const renderNetProfit = (row: EntityProfitTableRow): ReactNode => {
    if (row.netProfit == null) {
      return '-';
    }
    return (
      <span className={styles.cellNetProfit}>
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
      label: t('TABLE.REVENUE'),
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
      label: t('TABLE.NET_PROFIT'),
      align: Alignment.RIGHT,
      format: renderNetProfit,
    },
  ];

  const tabs = [
    { key: EntityTab.CROPS, label: t('TABS.CROPS') },
    { key: EntityTab.ANIMALS, label: t('TABS.ANIMALS') },
    { key: EntityTab.ALL, label: t('TABS.ALL') },
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
