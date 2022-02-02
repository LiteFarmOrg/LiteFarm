import React from 'react';
import Table from '../../../../components/Table';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { userFarmsByFarmSelector } from '../../../userFarmSlice';
import { useSelector } from 'react-redux';

const Employee = ({ currencySymbol, tasks, startDate, endDate }) => {
  let data = [];
  let sortObj = {};
  const { t } = useTranslation();
  const userFarmsOfFarm = useSelector(userFarmsByFarmSelector);
  for (let task of tasks) {
    const assignee = userFarmsOfFarm.find((user) => user.user_id === task.assignee_user_id);
    const completedTime = moment(task.completed_time);
    const abandonedTime = moment(task.abandoned_time);
    if (
      ( completedTime.isSameOrAfter(startDate, 'day') &&
        completedTime.isSameOrBefore(endDate, 'day') &&
        task.duration) ||
      ( abandonedTime.isSameOrAfter(startDate, 'day') &&
        abandonedTime.isSameOrBefore(endDate, 'day') &&
        task.duration)
    ) {
      if (sortObj.hasOwnProperty(task.assignee_user_id)) {
        let referenceObj = sortObj[task.assignee_user_id];
        const currentWorkedTime = hourlyTwoDecimals(referenceObj.time);
        referenceObj.wage_amount =
          (currentWorkedTime * referenceObj.wage_amount +
            hourlyTwoDecimals(task.duration) * task.wage_at_moment) /
          (currentWorkedTime + hourlyTwoDecimals(task.duration));
        referenceObj.time = referenceObj.time + Number(task.duration);
      } else {
        let wage_amount = 0;

        // if (s.wage.type === 'hourly') {
        //   wage_amount = Number(parseFloat(s.wage_at_moment).toFixed(2));
        // }
        wage_amount = Number(parseFloat(task.wage_at_moment).toFixed(2));
        sortObj[task.assignee_user_id] = {
          time: Number(task.duration),
          wage_amount,
          employee: `${assignee.first_name} ${assignee.last_name.substring(0, 1).toUpperCase()}.`,
          shift_numbers: 1,
        };
      }
    }
  }

  let keys = Object.keys(sortObj);

  for (let k of keys) {
    let timeInHour = (sortObj[k].time / 60).toFixed(2);
    data.push({
      employee: sortObj[k].employee,
      time: timeInHour.toString() + ' HR',
      labour_cost:
        currencySymbol +
        Number((sortObj[k].time / 60) * sortObj[k].wage_amount)
          .toFixed(2)
          .toString(),
    });
  }

  function hourlyTwoDecimals(number) {
    return Number((number / 60).toFixed(2));
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
