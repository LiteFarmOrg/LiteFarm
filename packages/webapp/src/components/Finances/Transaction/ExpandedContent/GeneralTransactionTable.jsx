/*
 *  Copyright 2023 LiteFarm.org
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
import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '../../../Table/Table';
import { transactionTypeEnum } from '../../../../containers/Finances/useTransactions';

const formatData = (t, data) => {
  const formattedData = {
    [transactionTypeEnum.revenue]: {
      titleLabel: t('FINANCES.REVENUE'),
      amountLabel: t('common:AMOUNT'),
      tableData: data.items,
    },
    [transactionTypeEnum.expense]: {
      titleLabel: t('FINANCES.EXPENSES'),
      amountLabel: t('FINANCES.COST'),
      tableData: [{ title: data.note, amount: data.amount }],
    },
  };

  return formattedData[data.transactionType];
};

const getColumns = (mobileView, currencySymbol, titleLabel, amountLabel) => [
  {
    id: 'title',
    label: titleLabel,
    format: (d) => d.title,
    columnProps: {
      style: { padding: `0 ${mobileView ? 8 : 12}px` },
    },
  },
  {
    id: 'amount',
    label: amountLabel,
    align: 'right',
    format: (d) => currencySymbol + Math.abs(d.amount).toFixed(2),
    columnProps: {
      style: { width: '100px', paddingRight: `${mobileView ? 9 : 75}px` },
    },
  },
];

export default function GeneralTransactionTable({ data, currencySymbol, mobileView }) {
  const { t } = useTranslation();
  const { titleLabel, amountLabel, tableData } = formatData(t, data);

  if (!tableData?.length) {
    return null;
  }

  return (
    <Table
      kind="v2"
      columns={getColumns(mobileView, currencySymbol, titleLabel, amountLabel)}
      data={tableData}
      shouldFixTableLayout={true}
    />
  );
}
