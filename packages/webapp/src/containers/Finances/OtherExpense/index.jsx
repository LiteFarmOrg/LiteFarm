/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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

import React, { useEffect } from 'react';
import moment from 'moment';
import PageTitle from '../../../components/PageTitle';
import defaultStyles from '../styles.module.scss';
import styles from './styles.module.scss';
import { expenseSelector, allExpenseTypeSelector } from '../selectors';
import Table from '../../../components/Table';
import { TableKind } from '../../../components/Table/types';
import { getExpense, getFarmExpenseType } from '../actions';
import history from '../../../history';
import DateRangeSelector from '../../../components/Finances/DateRangeSelector';
import { BsCaretRight } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import { Semibold } from '../../../components/Typography';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { useSelector, useDispatch } from 'react-redux';
import useDateRangeSelector from '../../../components/DateRangeSelector/useDateRangeSelector';
import { SUNDAY } from '../../../util/dateRange';
import { createExpenseDetailsUrl, FINANCES_HOME_URL } from '../../../util/siteMapConstants';

const OtherExpense = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const expenses = useSelector(expenseSelector);
  const expenseTypes = useSelector(allExpenseTypeSelector);
  const { startDate, endDate } = useDateRangeSelector({ weekStartDate: SUNDAY });
  const currencySymbol = useCurrencySymbol();

  useEffect(() => {
    dispatch(getExpense());
    dispatch(getFarmExpenseType());
  }, []);

  useEffect(() => {
    computeTable();
    computeDetailedTable();
  }, [expenses]);

  const computeTable = () => {
    let dict = {};

    for (let e of expenses) {
      const expenseDate = moment(e.expense_date);

      if (
        expenseDate.isSameOrAfter(startDate, 'day') &&
        expenseDate.isSameOrBefore(endDate, 'day')
      ) {
        let id = e.expense_type_id;
        if (!dict.hasOwnProperty(id)) {
          let typeName = getExpenseType(id);
          dict[id] = {
            type: typeName,
            amount: e.value,
          };
        } else {
          dict[id].amount = dict[id].amount + e.value;
        }
      }
    }

    let data = [];
    let keys = Object.keys(dict);
    let total = 0;

    for (let k of keys) {
      data.push({
        type: dict[k].type,
        amount: dict[k].amount,
      });
      total += dict[k].amount;
    }
    return [data, total.toFixed(2)];
  };

  const computeDetailedTable = () => {
    let detailedHistory = [];

    let subTotal = 0;

    for (let e of expenses) {
      const expenseDate = moment(e.expense_date);

      if (
        expenseDate.isSameOrAfter(startDate, 'day') &&
        expenseDate.isSameOrBefore(endDate, 'day')
      ) {
        let amount = parseFloat(e.value);
        subTotal += amount;
        detailedHistory.push({
          date: moment(e.expense_date),
          type: getExpenseType(e.expense_type_id),
          amount: currencySymbol + amount.toFixed(2).toString(),
          expense_date: e.expense_date,
          note: e.note,
          expense_item_id: e.farm_expense_id,
          value: amount,
        });
      }
    }
    return [detailedHistory, subTotal.toFixed(2)];
  };

  const getExpenseType = (id) => {
    for (let type of expenseTypes) {
      if (type.expense_type_id === id) {
        return type.farm_id
          ? type.expense_name
          : t(`expense:${type.expense_translation_key}.EXPENSE_NAME`);
      }
    }
    return 'TYPE_NOT_FOUND';
  };

  const [data, totalData] = computeTable();
  const [detailedHistory, totalDetailed] = computeDetailedTable();

  const columns = [
    {
      id: 'type',
      Header: t('SALE.SUMMARY.TYPE'),
      accessor: (d) => d.type,
      minWidth: 80,
      Footer: <div>{t('SALE.SUMMARY.TOTAL')}</div>,
    },
    {
      id: 'amount',
      Header: t('common:AMOUNT'),
      accessor: 'amount',
      minWidth: 75,
      Cell: (d) => <span>{`${currencySymbol}${d.value.toFixed(2).toString()}`}</span>,
      Footer: <div>{currencySymbol + totalData}</div>,
    },
  ];

  const detailedColumns = [
    {
      id: 'date',
      Header: t('SALE.LABOUR.TABLE.DATE'),
      Cell: (d) => <span>{d.value.toDate().toLocaleDateString()}</span>,
      accessor: (d) => d.date,
      minWidth: 70,
      Footer: <div>{t('SALE.SUMMARY.SUBTOTAL')}</div>,
    },
    {
      id: 'type',
      Header: t('SALE.LABOUR.TABLE.TYPE'),
      accessor: (d) => d.type,
      minWidth: 55,
    },
    {
      id: 'name',
      Header: t('common:NAME'),
      accessor: (d) => d.note,
      minWidth: 55,
    },
    {
      id: 'amount',
      Header: t('common:AMOUNT'),
      accessor: 'value',
      Cell: (d) => <span>{`${currencySymbol}${d.value.toFixed(2).toString()}`}</span>,
      minWidth: 55,
      Footer: <div>{currencySymbol + totalDetailed}</div>,
    },
    {
      id: 'chevron',
      maxWidth: 25,
      accessor: () => <BsCaretRight />,
    },
  ];

  return (
    <div className={defaultStyles.financesContainer}>
      <PageTitle backUrl={FINANCES_HOME_URL} title={t('EXPENSE.OTHER_EXPENSES_TITLE')} />
      <DateRangeSelector />

      <Semibold style={{ marginBottom: '16px' }}>{t('EXPENSE.SUMMARY')}</Semibold>
      <div className={styles.tableContainer} style={{ marginBottom: '16px' }}>
        {data.length > 0 && (
          <Table
            kind={TableKind.V1}
            columns={columns}
            data={data}
            showPagination={true}
            pageSizeOptions={[5, 10, 20, 50]}
            defaultPageSize={5}
            minRows={5}
            className="-striped -highlight"
          />
        )}
        {data.length === 0 && <h4>{t('EXPENSE.NO_EXPENSE_YEAR')}</h4>}
      </div>
      <Semibold style={{ marginBottom: '16px' }}>{t('EXPENSE.DETAILED_HISTORY')}</Semibold>
      <div className={styles.tableContainer}>
        {detailedHistory.length > 0 && (
          <div>
            <Table
              kind={TableKind.V1}
              columns={detailedColumns}
              data={detailedHistory}
              showPagination={true}
              pageSizeOptions={[5, 10, 20, 50]}
              defaultPageSize={5}
              minRows={5}
              className="-striped -highlight"
              getTdProps={(state, rowInfo, column, instance) => {
                return {
                  onClick: (e, handleOriginal) => {
                    if (rowInfo && rowInfo.original) {
                      const expense_id = rowInfo.original.expense_item_id;
                      history.push(createExpenseDetailsUrl(expense_id));
                    }
                    if (handleOriginal) {
                      handleOriginal();
                    }
                  },
                };
              }}
            />
          </div>
        )}
        {detailedHistory.length === 0 && (
          <div>
            <h5>{t('EXPENSE.NO_EXPENSE')}</h5>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherExpense;
