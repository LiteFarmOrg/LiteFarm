import React from 'react';
import Table from '../../../../components/Table';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { userFarmsByFarmSelector } from '../../../userFarmSlice';
import { useSelector } from 'react-redux';
import { mapTasksToLabourItems } from '../../util';
import { taskTypesSelector } from '../../../taskTypeSlice';

const Employee = ({ currencySymbol, tasks, startDate, endDate }) => {
  const { t } = useTranslation();
  const taskTypes = useSelector(taskTypesSelector);
  const userFarmsOfFarm = useSelector(userFarmsByFarmSelector);
  const filteredTasks = tasks.filter((task) => {
    const completedTime = moment(task.complete_date);
    const abandonedTime = moment(task.abandon_date);
    return (
      (completedTime.isSameOrAfter(startDate, 'day') &&
        completedTime.isSameOrBefore(endDate, 'day') &&
        task.duration) ||
      (abandonedTime.isSameOrAfter(startDate, 'day') &&
        abandonedTime.isSameOrBefore(endDate, 'day') &&
        task.duration)
    );
  });
  const { tasksByEmployee: data } = mapTasksToLabourItems(
    filteredTasks,
    taskTypes,
    userFarmsOfFarm,
    currencySymbol,
  );

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
      accessor: (d) => `${currencySymbol}${d.labourCost.toFixed(2)}`,
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
