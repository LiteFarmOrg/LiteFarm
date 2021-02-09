import React, { useState } from 'react';
import PureHarvestLog from '../../../components/Logs/HarvestLog';
import { defaultDateSelector, setDefaultDate } from '../Utility/logSlice';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

function HarvestLog() {
  const date = useState(moment());

  const dispatch = useDispatch();

  const setDate = (date) => {
    return dispatch(setDefaultDate(date._i));
  };

  const { defaultDate } = useSelector(defaultDateSelector);

  return (
    <>
      <PureHarvestLog
        setCurrentDate={date[0]}
        setNewDate={setDate}
        // setDefaultDate={defaultDate}
      />
    </>
  );
}

export default HarvestLog;
