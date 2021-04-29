import React from 'react';
import Table from '../../../../components/Table';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const Task = ({ currencySymbol, shifts, startDate, endDate }) => {
  let data = [];
  let sortObj = {};
  const { t } = useTranslation(['translation', 'task']);
  for (let s of shifts) {
    if (moment(s.start_time).isBetween(moment(startDate), moment(endDate))) {
      if (sortObj.hasOwnProperty(s.task_id)) {
        sortObj[s.task_id].time += parseInt(s.duration, 10);
        sortObj[s.task_id].labour_cost += parseFloat(s.wage_at_moment) * (s.duration / 60);
      } else {
        sortObj[s.task_id] = {
          time: parseInt(s.duration, 10),
          labour_cost: parseFloat(s.wage_at_moment) * (s.duration / 60),
          task: t(`task:${s.task_translation_key}`),
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
