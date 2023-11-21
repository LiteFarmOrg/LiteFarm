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

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import EnhancedTable from '../../../Table/v2';
import StateTab from '../../../RouterTab/StateTab';

const tabsEnum = {
  EMPLOYEE: 'employee',
  TASKS: 'tasks',
};

export default function LabourTable({ data: transaction, currencySymbol }) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(tabsEnum.EMPLOYEE);

  const employeeTotalHours = useMemo(
    () => calculateTotalHours(transaction.items.EMPLOYEE),
    [transaction],
  );

  const taskTotalHours = useMemo(
    () => calculateTotalHours(transaction.items.TASK_TYPE),
    [transaction],
  );

  const employeeColumns = useMemo(
    () => [
      {
        id: 'employee',
        label: t('SALE.LABOUR.TABLE.EMPLOYEE'),
        Footer: <div className={styles.footer}>{t('SALE.LABOUR.TABLE.DAILY_TOTAL')}</div>,
        columnProps: {
          style: { width: '33.33%' },
        },
      },
      {
        id: 'time',
        label: t('SALE.LABOUR.TABLE.TIME'),
        format: (d) => `${d.time} h`,
        align: 'right',
        Footer: <b>{employeeTotalHours} h</b>,
        columnProps: {
          style: { width: '33.33%' },
        },
      },
      {
        id: 'labourCost',
        label: t('SALE.LABOUR.TABLE.LABOUR_COST'),
        format: (d) => {
          return (
            <span>
              {currencySymbol}
              {Math.abs(d.labourCost).toFixed(2)}
            </span>
          );
        },
        align: 'right',
        Footer: (
          <b>
            {currencySymbol}
            {Math.abs(transaction.amount).toFixed(2)}
          </b>
        ),
        columnProps: {
          style: { width: '33.33%' },
        },
      },
    ],
    [transaction, currencySymbol],
  );

  const tasksColumns = useMemo(
    () => [
      {
        id: 'taskType',
        label: t('SALE.LABOUR.TABLE.TASK'),
        Footer: <div className={styles.footer}>{t('SALE.LABOUR.TABLE.DAILY_TOTAL')}</div>,
        component: 'th',
        columnProps: {
          style: { width: '33.33%' },
        },
      },
      {
        id: 'time',
        label: t('SALE.LABOUR.TABLE.TIME'),
        format: (d) => `${d.time} h`,
        align: 'right',
        Footer: <b>{taskTotalHours} h</b>,
        columnProps: {
          style: { width: '33.33%' },
        },
      },
      {
        id: 'labourCost',
        label: t('SALE.LABOUR.TABLE.LABOUR_COST'),
        format: (d) => {
          return (
            <span>
              {currencySymbol}
              {Math.abs(d.labourCost).toFixed(2)}
            </span>
          );
        },
        align: 'right',
        Footer: (
          <b>
            {currencySymbol}
            {Math.abs(transaction.amount).toFixed(2)}
          </b>
        ),
        columnProps: {
          style: { width: '33.33%' },
        },
      },
    ],
    [transaction, currencySymbol],
  );

  return (
    <div className={styles.labourTable}>
      <StateTab
        className={styles.tabs}
        state={activeTab}
        setState={setActiveTab}
        tabs={[
          {
            label: t('SALE.LABOUR.EMPLOYEES'),
            key: 'employee',
          },
          {
            label: t('SALE.LABOUR.TASKS'),
            key: 'tasks',
          },
        ]}
      />
      {activeTab === tabsEnum.EMPLOYEE && (
        <EnhancedTable
          columns={employeeColumns}
          data={transaction.items.EMPLOYEE}
          minRow={10}
          shouldFixTableLayout={true}
        />
      )}
      {activeTab === tabsEnum.TASKS && (
        <EnhancedTable
          columns={tasksColumns}
          data={transaction.items.TASK_TYPE}
          minRow={10}
          shouldFixTableLayout={true}
        />
      )}
    </div>
  );
}

LabourTable.propTypes = {
  data: PropTypes.shape({
    items: PropTypes.shape({
      EMPLOYEE: PropTypes.arrayOf(
        PropTypes.shape({
          time: PropTypes.number.isRequired,
          labourCost: PropTypes.number.isRequired,
        }),
      ).isRequired,
      TASK_TYPE: PropTypes.arrayOf(
        PropTypes.shape({
          taskType: PropTypes.string.isRequired,
          labourCost: PropTypes.number.isRequired,
        }),
      ).isRequired,
    }).isRequired,
    amount: PropTypes.number.isRequired,
  }).isRequired,
};

const calculateTotalHours = (entries) => {
  return entries.reduce((sum, entry) => sum + entry.time, 0);
};
