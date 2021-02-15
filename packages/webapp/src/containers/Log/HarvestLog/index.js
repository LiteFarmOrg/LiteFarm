import React, { useState, useEffect } from 'react';
import PureHarvestLog from '../../../components/Logs/HarvestLog';
import {
  harvestLogDataSelector,
  resetHarvestLog,
  harvestLogData,
  harvestFormData,
  canEditStepOneSelector,
  canEditStepOne,
} from '../Utility/logSlice';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { fieldsSelector } from '../../fieldSlice';
import { currentFieldCropsSelector } from '../../fieldCropSlice';
import { userFarmSelector } from '../../userFarmSlice';
import { convertToMetric, getUnit } from '../../../util';
import { getHarvestUseTypes } from '../actions';
import { getFieldCrops } from '../../saga';
import { currentLogSelector } from '../selectors';

function HarvestLog() {
  const farm = useSelector(userFarmSelector);
  let [unit, setUnit] = useState(getUnit(farm, 'kg', 'lb'));
  const dispatch = useDispatch();
  const defaultData = useSelector(harvestLogDataSelector);
  const isEditStepOne = useSelector(canEditStepOneSelector);
  const selectedLog = useSelector(currentLogSelector);
  const fields = useSelector(fieldsSelector);
  const crops = useSelector(currentFieldCropsSelector);

  useEffect(() => {
    dispatch(getFieldCrops());
    dispatch(getHarvestUseTypes);
  }, []);

  const onBack = () => {
    dispatch(resetHarvestLog());
    history.push('/new_log');
  };

  const onNext = (data) => {
    if (defaultData.selectedUseTypes) {
      data.selectedUseTypes = defaultData.selectedUseTypes;
    }
    dispatch(harvestLogData(data));
    let formValue = !isEditStepOne
      ? {
          activity_kind: 'harvest',
          date: data.defaultDate,
          crops: data.defaultCrop,
          fields: data.defaultField,
          notes: data.defaultNotes,
          quantity_kg: convertToMetric(data.defaultQuantity, unit, 'kg'),
        }
      : {
          activity_id: selectedLog.activity_id,
          activity_kind: 'harvest',
          date: data.defaultDate,
          crops: data.defaultCrop,
          fields: data.defaultField,
          notes: data.defaultNotes,
          quantity_kg: convertToMetric(data.defaultQuantity, unit, 'kg'),
        };
    dispatch(harvestFormData(formValue));
    dispatch(canEditStepOne(false));

    setTimeout(() => {
      history.push('/harvest_use_type');
    }, 200);
  };

  return (
    <>
      <PureHarvestLog
        onGoBack={onBack}
        onNext={onNext}
        fields={fields}
        crops={crops}
        unit={unit}
        defaultData={defaultData}
        isEdit={isEditStepOne}
        selectedLog={selectedLog}
        dispatch={dispatch}
      />
    </>
  );
}

export default HarvestLog;
