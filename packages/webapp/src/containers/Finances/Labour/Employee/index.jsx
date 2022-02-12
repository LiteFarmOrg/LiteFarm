import React from 'react';
import Table from '../../../../components/Table';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { userFarmsByFarmSelector } from '../../../userFarmSlice';
import { useSelector } from 'react-redux';
import { roundToTwoDecimal } from '../../../../util';

const Employee = ({ currencySymbol, tasks, startDate, endDate }) => {
  let data = [];
  let sortObj = {};
  const { t } = useTranslation();
  const userFarmsOfFarm = useSelector(userFarmsByFarmSelector);
  for (let task of tasks) {
    const assignee = userFarmsOfFarm.find((user) => user.user_id === task.assignee_user_id);
    const completedTime = moment(task.complete_date);
    const abandonedTime = moment(task.abandon_date);
    if (
      (completedTime.isSameOrAfter(startDate, 'day') &&
        completedTime.isSameOrBefore(endDate, 'day') &&
        task.duration) ||
      (abandonedTime.isSameOrAfter(startDate, 'day') &&
        abandonedTime.isSameOrBefore(endDate, 'day') &&
        task.duration)
    ) {
      const minutes = parseInt(task.duration, 10);
      const hours = roundToTwoDecimal(minutes / 60);
      const rate = roundToTwoDecimal(task.wage_at_moment);
      const labour_cost = roundToTwoDecimal(rate * hours);

      if (sortObj.hasOwnProperty(task.assignee_user_id)) {
        let referenceObj = sortObj[task.assignee_user_id];
        referenceObj.labour_cost = roundToTwoDecimal(roundToTwoDecimal(referenceObj.labour_cost) + labour_cost);
        referenceObj.hours = roundToTwoDecimal(referenceObj.hours + hours);
      } else {
        sortObj[task.assignee_user_id] = {
          hours,
          labour_cost,
          employee: `${assignee.first_name} ${assignee.last_name.substring(0, 1).toUpperCase()}.`,
        };
      }
    }
  }

  let keys = Object.keys(sortObj);

  for (let k of keys) {
    data.push({
      employee: sortObj[k].employee,
      time: sortObj[k].hours.toFixed(2) + ' HR',
      labour_cost: currencySymbol + sortObj[k].labour_cost.toFixed(2),
    });
  }

  const columns = [
    {
      id: 'employee',
      Header: t('SALE.LABOUR.TABLE.EMPLOYEE'),
      accessor: (d) => d.employee,
      minWidth: 80,
    },
    {
      id: 'time',
      Header: t('SALE.LABOUR.TABLE.TIME'),
      accessor: (d) => d.time,
      minWidth: 75,
    },
    {
      id: 'labour_cost',
      Header: t('SALE.LABOUR.TABLE.LABOUR_COST'),
      accessor: (d) => d.labour_cost,
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      showPagination={true}
      pageSizeOptions={[10, 20, 50]}
      defaultPageSize={10}
      minRows={5}
      className="-striped -highlight"
    />
  );
};

export default Employee;
