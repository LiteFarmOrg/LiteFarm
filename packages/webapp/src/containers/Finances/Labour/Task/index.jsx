import React from 'react';
import Table from '../../../../components/Table';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { roundToTwoDecimal } from '../../../../util';

const Task = ({ currencySymbol, tasks, startDate, endDate }) => {
  let data = [];
  let sortObj = {};
  const { t } = useTranslation(['translation', 'task']);
  for (let task of tasks) {
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

      if (sortObj.hasOwnProperty(task.task_type_id)) {
        sortObj[task.task_type_id].time = roundToTwoDecimal(sortObj[task.task_type_id].time) + minutes;
        sortObj[task.task_type_id].labour_cost = roundToTwoDecimal(sortObj[task.task_type_id].labour_cost) + labour_cost;
      } else {
        sortObj[task.task_type_id] = {
          time: minutes,
          labour_cost,
          task: t(`task:${task.taskType.task_translation_key}`),
        };
      }
    }
  }

  let keys = Object.keys(sortObj);

  for (let k of keys) {
    let obj = sortObj[k];
    data.push({
      task: obj.task,
      time: roundToTwoDecimal(obj.time / 60) + ' HR',
      labour_cost: currencySymbol + roundToTwoDecimal(obj.labour_cost).toFixed(2),
    });
  }

  const columns = [
    {
      id: 'task',
      Header: t('SALE.LABOUR.TABLE.TASK'),
      accessor: (d) => d.task,
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

export default Task;
