import React from 'react';
import Table from '../../../../components/Table';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const Task = ({ currencySymbol, tasks, startDate, endDate }) => {
  let data = [];
  let sortObj = {};
  const { t } = useTranslation(['translation', 'task']);
  for (let task of tasks) {
    const completedTime = moment(task.completed_time).startOf('day').utc();
    const abandonedTime = moment(task.abandoned_time).startOf('day').utc();
    if (
      ( completedTime.isSameOrAfter(moment(startDate)) &&
        completedTime.isSameOrBefore(moment(endDate)) &&
        task.duration) ||
      ( abandonedTime.isSameOrAfter(moment(startDate)) &&
        abandonedTime.isSameOrBefore(moment(endDate)) &&
        task.duration)
    ) {
      if (sortObj.hasOwnProperty(task.task_type_id)) {
        sortObj[task.task_type_id].time += parseInt(task.duration, 10);
        sortObj[task.task_type_id].labour_cost +=
          parseFloat(task.wage_at_moment) * (task.duration / 60);
      } else {
        sortObj[task.task_type_id] = {
          time: parseInt(task.duration, 10),
          labour_cost: parseFloat(task.wage_at_moment) * (task.duration / 60),
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
      time: (obj.time / 60).toFixed(2).toString() + ' HR',
      labour_cost: currencySymbol + obj.labour_cost.toFixed(2),
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
