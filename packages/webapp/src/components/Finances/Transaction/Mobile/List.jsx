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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import ExpandableItem from '../../../Expandable/ExpandableItem';
import ExpandedContent from '../ExpandedContent';
import Button from '../../../Form/Button';
import TransactionItem from './Item';
import useExpandable from '../../../Expandable/useExpandableItem';
import { useCurrencySymbol } from '../../../../containers/hooks/useCurrencySymbol';
import styles from './styles.module.scss';

export const MainContent = ({ t, note, typeLabel, amount, icon, currencySymbol }) => {
  return (
    <TransactionItem
      transaction={note || t('FINANCES.TRANSACTION.LABOUR_EXPENSE')}
      type={typeLabel || t('SALE.FINANCES.LABOUR_LABEL')}
      amount={amount}
      iconKey={icon || 'LABOUR'}
      currencySymbol={currencySymbol}
    />
  );
};

const Rows = ({ t, data, currencySymbol }) => {
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });
  const rows = [];

  data.forEach((values, index) => {
    // TODO: LF-3746 add "date" row as necessary

    const isExpanded = expandedIds.includes(index);

    rows.push(
      <div
        key={index}
        className={clsx(styles.expandableItemWrapper, isExpanded && styles.expanded)}
      >
        <ExpandableItem
          isExpanded={isExpanded}
          onClick={() => toggleExpanded(index)}
          mainContent={<MainContent t={t} {...values} currencySymbol={currencySymbol} />}
          expandedContent={<ExpandedContent data={values} />}
          iconClickOnly={false}
          classes={{ mainContentWithIcon: styles.expandableItem }}
          key={`transaction-${index}`}
        />
      </div>,
    );
  });
  return <div>{rows}</div>;
};

export default function TransactionList({ data, minRows = 10 }) {
  const [visibleRows, setVisibleRows] = useState(minRows);

  const { t } = useTranslation(['translation', 'expense', 'revenue']);
  const currencySymbol = useCurrencySymbol();

  const onClickLoadMore = () => {
    setVisibleRows(Math.min(visibleRows + minRows, data.length));
  };

  return (
    <div className={styles.transactionList}>
      <Rows t={t} data={data.slice(0, visibleRows)} currencySymbol={currencySymbol} />
      {data.length > visibleRows && (
        <div className={styles.buttonWrapper}>
          <Button
            className={styles.loadMoreButton}
            onClick={onClickLoadMore}
            color={'secondary'}
            sm={true}
          >
            {t('TABLE.LOAD_MORE')}
          </Button>
        </div>
      )}
    </div>
  );
}
