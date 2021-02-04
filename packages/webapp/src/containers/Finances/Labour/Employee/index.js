import React from 'react';
import Table from '../../../../components/Table';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const Employee = ({ currencySymbol, shifts, startDate, endDate }) => {
  let data = [];
  let sortObj = {};
  const { t } = useTranslation();
  for (let s of shifts) {
    if (moment(s.start_time).isBetween(moment(startDate), moment(endDate))) {
      if (sortObj.hasOwnProperty(s.user_id)) {
        let referenceObj = sortObj[s.user_id];
        const currentWorkedTime = hourlyTwoDecimals(referenceObj.time);
        referenceObj.wage_amount =
          (currentWorkedTime * referenceObj.wage_amount +
            hourlyTwoDecimals(s.duration) * s.wage_at_moment) /
          (currentWorkedTime + hourlyTwoDecimals(s.duration));
        referenceObj.time = referenceObj.time + Number(s.duration);
      } else {
        let wage_amount = 0;

        if (s.wage.type === 'hourly') {
          wage_amount = Number(parseFloat(s.wage_at_moment).toFixed(2));
        }
        sortObj[s.user_id] = {
          time: Number(s.duration),
          wage_amount,
          employee: s.first_name + ' ' + s.last_name.substring(0, 1).toUpperCase() + '.',
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
      showPagination={false}
      minRows={5}
      className="-striped -highlight"
    />
  );
};

export default Employee;
