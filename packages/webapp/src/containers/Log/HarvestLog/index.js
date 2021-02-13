import React, { useState, useEffect } from 'react';
import PureHarvestLog from '../../../components/Logs/HarvestLog';
import {
  harvestLogDataSelector,
  resetHarvestLog,
  harvestLogData,
  harvestFormData,
} from '../Utility/logSlice';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { fieldsSelector } from '../../fieldSlice';
import { currentFieldCropsSelector } from '../../fieldCropSlice';
import { userFarmSelector } from '../../userFarmSlice';
import { convertToMetric, getUnit } from '../../../util';
import { getHarvestUseTypes } from '../actions';
import { getFieldCrops } from '../../saga';

function HarvestLog() {
  const farm = useSelector(userFarmSelector);
  let [unit, setUnit] = useState(getUnit(farm, 'kg', 'lb'));
  const dispatch = useDispatch();
  const defaultData = useSelector(harvestLogDataSelector);

  useEffect(() => {
    dispatch(getFieldCrops());
    dispatch(getHarvestUseTypes);
  }, []);

  const onBack = () => {
    dispatch(resetHarvestLog());
    history.push('/new_log');
  };

  const onNext = (data) => {
    dispatch(harvestLogData(data));
    let formValue = {
      activity_kind: 'harvest',
      date: data.defaultDate,
      crops: data.defaultCrop,
      fields: data.defaultField,
      notes: data.defaultNotes,
      quantity_kg: convertToMetric(data.defaultQuantity, unit, 'kg'),
    };
    dispatch(harvestFormData(formValue));

    setTimeout(() => {
      history.push('/harvest_use_type');
    }, 200);
  };

  const fields = useSelector(fieldsSelector);
  const crops = useSelector(currentFieldCropsSelector);

  return (
    <>
      <PureHarvestLog
        onGoBack={onBack}
        onNext={onNext}
        fields={fields}
        crops={crops}
        unit={unit}
        defaultData={defaultData}
      />
    </>
  );
}

export default HarvestLog;
