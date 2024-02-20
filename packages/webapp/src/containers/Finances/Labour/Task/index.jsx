import React from 'react';
import Table from '../../../../components/Table/Table';
import { TableType } from '../../../../components/Table/types';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { taskTypesSelector } from '../../../taskTypeSlice';
import { userFarmsByFarmSelector } from '../../../userFarmSlice';
import { mapTasksToLabourItems } from '../../util';
import { LABOUR_ITEMS_GROUPING_OPTIONS } from '../../constants';

const Task = ({ currencySymbol, tasks, startDate, endDate }) => {
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
  const { [LABOUR_ITEMS_GROUPING_OPTIONS.TASK_TYPE]: data } = mapTasksToLabourItems(
    filteredTasks,
    taskTypes,
    userFarmsOfFarm,
    currencySymbol,
  );

  const columns = [
    {
      id: 'task',
      Header: t('SALE.LABOUR.TABLE.TASK'),
      accessor: (d) => d.taskType,
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
      accessor: (d) => d.labourCost,
      Cell: (row) => `${currencySymbol}${row.value.toFixed(2)}`,
    },
  ];

  return (
    <Table
      kind={TableType.V1}
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

export default Task;
