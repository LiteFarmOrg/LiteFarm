import React, { useState } from 'react';
import PureHarvestLog from '../../../components/Logs/HarvestLog';
import { defaultDateSelector, setDefaultDate } from '../Utility/logSlice';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import history from '../../../history';
import { fieldsSelector } from '../../fieldSlice';
import { currentFieldCropsSelector } from '../../fieldCropSlice';
import { userFarmSelector } from '../../userFarmSlice';
import { convertToMetric, getUnit } from '../../../util';

function HarvestLog() {
  let [date, setDate] = useState(moment());
  const farm = useSelector(userFarmSelector);
  let [unit, setUnit] = useState(getUnit(farm, 'kg', 'lb'));
  const dispatch = useDispatch();

  const setNewDate = (date) => {
    setDate(date);
    dispatch(setDefaultDate(date._i));
  };

  const onBack = () => {
    history.push('/new_log');
  };

  const { defaultDate } = useSelector(defaultDateSelector);
  const fields = useSelector(fieldsSelector);
  const crops = useSelector(currentFieldCropsSelector);

  return (
    <>
      <PureHarvestLog
        setCurrentDate={date}
        setNewDate={setNewDate}
        setDefaultDate={defaultDate}
        onGoBack={onBack}
        fields={fields}
        crops={crops}
        unit={unit}
      />
    </>
  );
}

export default HarvestLog;
