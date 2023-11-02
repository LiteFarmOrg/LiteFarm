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

import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ReactComponent as ReportIcon } from '../../../assets/images/finance/Report-icn.svg';
import FinanceDateRangeSelector from '../../../components/Finances/DateRangeSelector';
import Button from '../../../components/Form/Button';
import TextButton from '../../../components/Form/Button/TextButton';
import ModalComponent from '../../../components/Modals/ModalComponent/v2';
import { LABOUR_ITEMS_GROUPING_OPTIONS } from '../constants';
import { downloadFinanceReport } from '../saga';
import { dateRangeDataSelector } from '../selectors';
import useTransactions, { transactionTypeEnum } from '../useTransactions';
import styles from './styles.module.scss';

const Report = () => {
  const { t } = useTranslation();

  const dateRange = useSelector(dateRangeDataSelector);
  // const defaultTransactionsFilter = useSelector(transactionsFilterSelector);

  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState(dateRange);

  const dispatch = useDispatch();
  const filterRef = useRef({});
  const transactions = useTransactions({ dateFilter });

  const sumTransactionAmount = (transactionType) => {
    const filteredTransactions = transactions.filter(
      (transaction) => transaction.transactionType === transactionType,
    );
    const summary = {};
    filteredTransactions.forEach((transaction) => {
      summary[transaction.typeLabel] =
        summary[transaction.typeLabel] ?? 0 + Math.abs(transaction.amount);
    });
    return summary;
  };

  const expenseSummary = useMemo(
    () => sumTransactionAmount(transactionTypeEnum.expense),
    [transactions],
  );

  const revenueSummary = useMemo(
    () => sumTransactionAmount(transactionTypeEnum.revenue),
    [transactions],
  );

  const cropRevenueSummary = useMemo(() => {
    const filteredTransactions = transactions.filter(
      (transaction) => transaction.transactionType === transactionTypeEnum.cropRevenue,
    );
    const summary = {};
    filteredTransactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        summary[item.title] = {
          amount: summary[item.title]?.amount ?? 0 + Math.abs(item.amount),
          quantity: summary[item.title]?.quantity ?? 0 + Math.abs(item.quantity),
          quantityUnit: item.quantityUnit,
        };
      });
    });
    return summary;
  }, [transactions]);

  const labourSummary = useMemo(() => {
    const filteredTransactions = transactions.filter(
      (transaction) => transaction.transactionType === transactionTypeEnum.labourExpense,
    );
    const summary = {};
    filteredTransactions.forEach((transaction) => {
      const employeeItems = transaction.items[LABOUR_ITEMS_GROUPING_OPTIONS.EMPLOYEE];
      employeeItems.forEach((employeeItem) => {
        summary[employeeItem.employee] = {
          duration: summary[employeeItem.employee]?.duration ?? 0 + employeeItem.time,
          amount: summary[employeeItem.employee]?.amount ?? 0 + employeeItem.labourCost,
        };
      });
    });
    return summary;
  }, [transactions]);

  const handleExport = () => {
    setIsExportReportOpen(false);
    dispatch(
      downloadFinanceReport({
        transactions,
        expenseSummary,
        revenueSummary,
        cropRevenueSummary,
        labourSummary,
        config: {
          dateFilter,
          typesFilter: filterRef.current,
        },
      }),
    );
  };

  return (
    <>
      <TextButton onClick={() => setIsExportReportOpen(true)} className={styles.reportButton}>
        <ReportIcon />
        {t('SALE.FINANCES.REPORT')}
      </TextButton>
      {isExportReportOpen && (
        <ModalComponent
          title={t('SALE.FINANCES.EXPORT_REPORT')}
          titleClassName={styles.title}
          dismissModal={() => setIsExportReportOpen(false)}
          buttonGroup={
            <Button fullLength onClick={handleExport} color={'primary'}>
              {t('common:EXPORT')}
            </Button>
          }
        >
          <FinanceDateRangeSelector onChange={setDateFilter} />
          {/*           <TransactionFilterContent
            transactionsFilter={defaultTransactionsFilter}
            filterRef={filterRef}
          /> */}
        </ModalComponent>
      )}
    </>
  );
};

export default Report;
