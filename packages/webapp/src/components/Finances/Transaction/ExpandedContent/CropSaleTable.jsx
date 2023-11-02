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
import Table from '../../../Table/v2';
import history from '../../../../history';
import styles from './styles.module.scss';

const getColumns = (t, mobileView, totalAmount, quantityTotal, currencySymbol) => [
  {
    id: 'title',
    label: t('FINANCES.TRANSACTION.CROPS'),
    format: (d) =>
      mobileView ? (
        <div className={styles.mobileCrops}>
          <div className={styles.mobileCropsTitle}>{d.title}</div>
          <div className={styles.mobileCropsQuantity}>
            {d.quantity} {d.quantityUnit}
          </div>
        </div>
      ) : (
        d.title
      ),
    columnProps: {
      style: { padding: `0 ${mobileView ? 8 : 12}px` },
    },
    Footer: mobileView ? null : t('FINANCES.TRANSACTION.DAILY_TOTAL'),
  },
  {
    id: mobileView ? null : 'quantity',
    label: mobileView ? null : t('common:QUANTITY'),
    align: 'right',
    format: (d) => `${d.quantity} ${d.quantityUnit}`,
    columnProps: {
      style: { width: '100px' },
    },
    Footer: mobileView ? null : <div className={styles.bold}>{quantityTotal}</div>,
  },
  {
    id: 'amount',
    label: t('FINANCES.REVENUE'),
    align: 'right',
    format: (d) => `${currencySymbol} ${Math.abs(d.amount).toFixed(2)}`,
    columnProps: {
      style: { width: '250px', paddingRight: `${mobileView ? 9 : 75}px` },
    },
    Footer: mobileView ? null : <div className={styles.bold}>{totalAmount}</div>,
  },
];

const FooterCell = ({ t, quantityTotal, totalAmount }) => (
  <div className={styles.mobileCropSaleFooterCell}>
    <div>{t('FINANCES.TRANSACTION.DAILY_TOTAL')}</div>
    <div className={styles.bold}>{quantityTotal}</div>
    <div className={styles.bold}>{totalAmount}</div>
  </div>
);

export default function CropSaleTable({ data, currencySymbol, mobileView }) {
  const { t } = useTranslation();
  const { items, amount, relatedId } = data;
  const quantityUnit = items?.[0]?.quantityUnit;
  const quantityTotal = items.reduce((total, { quantity }) => total + quantity, 0);
  const quantityWithUnit = `${quantityTotal} ${quantityUnit}`;
  const totalAmount = `${currencySymbol} ${amount.toFixed(2)}`;

  if (!items?.length) {
    return null;
  }

  return (
    <Table
      columns={getColumns(t, mobileView, totalAmount, quantityWithUnit, currencySymbol)}
      data={items}
      minRows={10}
      shouldFixTableLayout={true}
      FooterCell={
        mobileView
          ? () => <FooterCell t={t} totalAmount={totalAmount} quantityTotal={quantityWithUnit} />
          : null
      }
      onClickMore={() => history.push(`/revenue/${relatedId}`)}
    />
  );
}
