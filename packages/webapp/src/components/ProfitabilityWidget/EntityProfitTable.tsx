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
  expense: number;
  netProfit: number;
}

export interface EntityProfitTableLabels {
  variety: string;
  animal: string;
  entity: string;
  revenue: string;
  expense: string;
  netProfit: string;
  notYet: string;
  farmGeneral: string;
  tabs: { crops: string; animals: string; all: string };
}

export interface EntityProfitTableProps {
  rows: EntityProfitTableRow[];
  entityTab: EntityTab;
  onTabChange: (tab: EntityTab) => void;
  currencySymbol: string;
  labels: EntityProfitTableLabels;
}

const firstColumnLabel = (entityTab: EntityTab, labels: EntityProfitTableLabels): string => {
  if (entityTab === EntityTab.CROPS) return labels.variety;
  if (entityTab === EntityTab.ANIMALS) return labels.animal;
  return labels.entity;
};

const EntityProfitTable = ({
  rows,
  entityTab,
  onTabChange,
  currencySymbol,
  labels,
}: EntityProfitTableProps) => {
  const formatCurrency = (value: number): string =>
    `${currencySymbol}${Math.abs(value).toFixed(2)}`;

  const renderLabel = (row: EntityProfitTableRow): ReactNode => {
    if (row.kind === 'farm_general') {
      return labels.farmGeneral;
    }
    return row.label;
  };

  const renderRevenue = (row: EntityProfitTableRow): ReactNode => {
    if (row.revenue == null) {
      return <span className={styles.cellRevenueNotYet}>{labels.notYet}</span>;
    }
    return <span className={styles.cellRevenue}>{formatCurrency(row.revenue)}</span>;
  };

  const renderExpense = (row: EntityProfitTableRow): ReactNode => (
    <span className={styles.cellExpense}>{formatCurrency(row.expense)}</span>
  );

  const renderNetProfit = (row: EntityProfitTableRow): ReactNode => (
    <span className={styles.cellNetProfit}>
      {row.netProfit < 0 ? '-' : ''}
      {formatCurrency(row.netProfit)}
    </span>
  );

  const columns: TableV2Column[] = [
    {
      id: 'label',
      label: firstColumnLabel(entityTab, labels),
      format: (props: any) => renderLabel(props.row.original ?? props.row),
    },
    {
      id: 'revenue',
      label: labels.revenue,
      align: Alignment.RIGHT,
      format: (props: any) => renderRevenue(props.row.original ?? props.row),
    },
    {
      id: 'expense',
      label: labels.expense,
      align: Alignment.RIGHT,
      format: (props: any) => renderExpense(props.row.original ?? props.row),
    },
    {
      id: 'netProfit',
      label: labels.netProfit,
      align: Alignment.RIGHT,
      format: (props: any) => renderNetProfit(props.row.original ?? props.row),
    },
  ];

  const tabs = [
    { key: EntityTab.CROPS, label: labels.tabs.crops },
    { key: EntityTab.ANIMALS, label: labels.tabs.animals },
    { key: EntityTab.ALL, label: labels.tabs.all },
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
