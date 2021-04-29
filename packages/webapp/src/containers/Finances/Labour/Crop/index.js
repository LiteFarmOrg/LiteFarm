import React from 'react';
import Table from '../../../../components/Table';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { useTranslation } from 'react-i18next';

const moment = extendMoment(Moment);

const reformatByCropID = (final) => {
  let result = {};

  let fkeys = Object.keys(final);

  for (let fk of fkeys) {
    let crop_id = final[fk].crop_id;
    if (result.hasOwnProperty(crop_id)) {
      result[crop_id].profit += final[fk].profit;
      result[crop_id].duration += final[fk].duration;
    } else {
      result = Object.assign(result, {
        [crop_id]: {
          crop: final[fk].crop,
          field_id: final[fk].field_id,
          crop_id: final[fk].crop_id,
          profit: final[fk].profit,
          duration: final[fk].duration,
          field_crop_id: final[fk].field_crop_id,
        },
      });
    }
  }

  return result;
};

const getCropsByFieldID = (field_id, fieldCrops) => {
  let result = new Set();

  for (let fc of fieldCrops) {
    if (fc.field_id === field_id) {
      result.add(fc.field_crop_id);
    }
  }

  return Array.from(result);
};

const Crop = ({ currencySymbol, shifts, startDate, endDate, fieldCrops }) => {
  let data = [];
  const { t } = useTranslation(['translation', 'crop']);
  let final = Object.assign({}, {}); // crop: crop name, profit: number
  for (let fc of fieldCrops) {
    const range1 = moment.range(startDate, endDate);
    const range2 = moment.range(moment(fc.start_date), moment(fc.end_date));
    if (range1.overlaps(range2)) {
      final = Object.assign(final, {
        [fc.field_crop_id]: {
          crop: fc.crop_translation_key,
          field_id: fc.field_id,
          crop_id: fc.crop_id,
          profit: 0,
          duration: 0,
          field_crop_id: fc.field_crop_id,
        },
      });
    }
  }

  let unAllocatedShifts = {};

  if (shifts && shifts.length) {
    for (let s of shifts) {
      let field_crop_id = s.field_crop_id;
      if (moment(s.start_time).isBetween(startDate, endDate)) {
        if (field_crop_id !== null) {
          if (final.hasOwnProperty(field_crop_id)) {
            final[field_crop_id].profit =
              final[field_crop_id].profit +
              Number(s.wage_at_moment) * (Number(s.duration) / 60) * -1;
            final[field_crop_id].duration = final[field_crop_id].duration + Number(s.duration);
          } else {
            final[field_crop_id] = {
              crop: s.crop_translation_key,
              profit: Number(s.wage_at_moment) * (Number(s.duration) / 60) * -1,
              duration: Number(s.duration),
              field_crop_id: field_crop_id,
              crop_id: s.crop_id,
              field_id: s.field_id,
            };
          }
        }
        // else it's unallocated
        else {
          if (unAllocatedShifts.hasOwnProperty(s.field_id)) {
            unAllocatedShifts[s.field_id].value =
              unAllocatedShifts[s.field_id].value +
              Number(s.wage_at_moment) * (Number(s.duration) / 60);
            unAllocatedShifts[s.field_id].duration =
              unAllocatedShifts[s.field_id].duration + Number(s.duration);
          } else {
            unAllocatedShifts = Object.assign(unAllocatedShifts, {
              [s.field_id]: {
                value: Number(s.wage_at_moment) * (Number(s.duration) / 60),
                duration: Number(s.duration),
                hasAllocated: false,
              },
            });
          }
        }
      }
    }
  }

  let ukeys = Object.keys(unAllocatedShifts);

  for (let uk of ukeys) {
    // uk = field_id
    let uShift = unAllocatedShifts[uk];

    let waitForAllocate = getCropsByFieldID(uk, fieldCrops);

    let avg = Number(parseFloat(uShift.value / waitForAllocate.length).toFixed(2));

    let durationAvg = Number(parseFloat(uShift.duration / waitForAllocate.length).toFixed(2));

    let fkeys = Object.keys(final);

    for (let wa of waitForAllocate) {
      for (let fk of fkeys) {
        if (Number(fk) === Number(wa)) {
          final[fk].profit -= avg;
          final[fk].duration += durationAvg;
        }
      }
    }

    if (waitForAllocate.length > 0 && fkeys.length > 0) {
      unAllocatedShifts[uk].hasAllocated = true;
    }
  }

  final = reformatByCropID(final);

  let showUnallocated = false;
  let unAllocatedObj = { crop: t('SALE.FINANCES.UNALLOCATED_CROP'), time: 0, labour_cost: 0 };

  for (let uk of ukeys) {
    let uShift = unAllocatedShifts[uk];
    if (!uShift.hasAllocated) {
      showUnallocated = true;
      unAllocatedObj.time += uShift.duration;
      unAllocatedObj.labour_cost += uShift.value;
    }
  }

  unAllocatedObj.time = parseFloat(unAllocatedObj.time / 60).toFixed(2) + ' HR';
  unAllocatedObj.labour_cost =
    currencySymbol + parseFloat(unAllocatedObj.labour_cost).toFixed(2).toString();

  let fkeys = Object.keys(final);

  for (let fk of fkeys) {
    data.push({
      crop: final[fk].crop,
      time: parseFloat(final[fk].duration / 60).toFixed(2) + ' HR',
      labour_cost: currencySymbol + parseFloat(final[fk].profit * -1).toFixed(2),
    });
  }

  if (showUnallocated) {
    data.push(unAllocatedObj);
  }

  const columns = [
    {
      id: 'crop',
      Header: t('SALE.LABOUR.TABLE.CROP'),
      accessor: (d) => t(`crop:${d.crop}`),
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
    <div>
      <Table
        columns={columns}
        data={data}
        showPagination={true}
        pageSizeOptions={[10, 20, 50]}
        defaultPageSize={10}
        minRows={5}
        className="-striped -highlight"
      />
    </div>
  );
};

export default Crop;
