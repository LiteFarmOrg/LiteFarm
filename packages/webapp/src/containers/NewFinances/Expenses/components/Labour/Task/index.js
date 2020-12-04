import React from 'react';
import Table from '../../../../../../components/Table';
import moment from 'moment';

const Task = ({ shifts, startDate, endDate }) => {
  let data = [];
  let sortObj = {};

  for (let s of shifts) {
    if (moment(s.start_time).isBetween(moment(startDate), moment(endDate))) {
      if (sortObj.hasOwnProperty(s.task_id)) {
        sortObj[s.task_id].time += parseInt(s.duration, 10);
        sortObj[s.task_id].labour_cost += parseFloat(s.wage.amount) * (s.duration / 60);
      } else {
        sortObj[s.task_id] = {
          time: parseInt(s.duration, 10),
          labour_cost: parseFloat(s.wage.amount) * (s.duration / 60),
          task: s.task_name,
        };
      }
    }
  }

  let keys = Object.keys(sortObj);

  for (let k of keys) {
    let obj = sortObj[k];
    data.push({
      task: obj.task,
      time: (obj.time / 60).toFixed(1).toString() + ' HR',
      labour_cost: '$' + obj.labour_cost.toFixed(2),
    });
  }

  const columns = [
    {
      id: 'task',
      Header: 'Task',
      accessor: (d) => d.task,
      minWidth: 80,
    },
    {
      id: 'time',
      Header: 'Time',
      accessor: (d) => d.time,
      minWidth: 75,
    },
    {
      id: 'labour_cost',
      Header: 'Labour Cost',
      accessor: (d) => d.labour_cost,
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      showPagination={false}
      minRows={5}
      className="-striped -highlight"
    />
  );
};

export default Task;
