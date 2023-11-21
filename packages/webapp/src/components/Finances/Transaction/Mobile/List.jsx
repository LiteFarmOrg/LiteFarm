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
import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTransactionDate } from '../../../../containers/Finances/util';
import { useCurrencySymbol } from '../../../../containers/hooks/useCurrencySymbol';
import { isSameDay } from '../../../../util/date';
import ExpandableItem from '../../../Expandable/ExpandableItem';
import useExpandable from '../../../Expandable/useExpandableItem';
import Button from '../../../Form/Button';
import ExpandedContent from '../ExpandedContent';
import TransactionItem from './Item';
import styles from './styles.module.scss';

export const MainContent = ({ t, note, typeLabel, amount, icon, currencySymbol }) => {
  return (
    <TransactionItem
      transaction={note}
      type={typeLabel}
      amount={amount}
      iconKey={icon}
      currencySymbol={currencySymbol}
    />
  );
};

const Rows = ({ t, data, currencySymbol, mobileView }) => {
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });
  const rows = [];
  let groupDate = null;

  data.forEach((values) => {
    const itemDate = new Date(values.date);

    if (!isSameDay(groupDate, itemDate)) {
      groupDate = itemDate;
      rows.push(
        <h4 key={values.date} className={styles.transactionDate}>
          {formatTransactionDate(itemDate)}
        </h4>,
      );
    }

    const { transactionType, relatedId, date } = values;
    const key = `${transactionType}+${relatedId || date}`;
    const isExpanded = expandedIds.includes(key);

    rows.push(
      <div key={key} className={clsx(styles.expandableItemWrapper, isExpanded && styles.expanded)}>
        <ExpandableItem
          isExpanded={isExpanded}
          onClick={() => toggleExpanded(key)}
          mainContent={<MainContent t={t} {...values} currencySymbol={currencySymbol} />}
          expandedContent={
            <ExpandedContent
              data={values}
              currencySymbol={currencySymbol}
              mobileView={mobileView}
            />
          }
          iconClickOnly={false}
          classes={{ mainContentWithIcon: styles.expandableItem }}
          itemKey={`transaction-${key}`}
        />
      </div>,
    );
  });
  return <div>{rows}</div>;
};

export default function TransactionList({ data, minRows = 10, mobileView }) {
  const [visibleRows, setVisibleRows] = useState(minRows);

  const { t } = useTranslation(['translation', 'expense', 'revenue']);
  const currencySymbol = useCurrencySymbol();

  const onClickLoadMore = () => {
    setVisibleRows(Math.min(visibleRows + minRows, data.length));
  };

  return (
    <div className={styles.transactionList}>
      <Rows
        t={t}
        data={data.slice(0, visibleRows)}
        currencySymbol={currencySymbol}
        mobileView={mobileView}
      />
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
