import React, { useEffect, useState } from 'react';
import PureHarvestLog from '../../../components/Logs/HarvestLog';
import {
  canEditSelector,
  canEditStepOne,
  canEditStepOneSelector,
  harvestFormData,
  harvestLogData,
  harvestLogDataSelector,
  resetHarvestLog,
} from '../Utility/logSlice';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { currentAndPlannedFieldCropsSelector } from '../../fieldCropSlice';
import { cropLocationsSelector } from '../../locationSlice';
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
  const locations = useSelector(cropLocationsSelector);
  const crops = useSelector(currentAndPlannedFieldCropsSelector);
  const isEdit = useSelector(canEditSelector);
  useEffect(() => {
    dispatch(getFieldCrops());
    dispatch(getHarvestUseTypes());
  }, []);

  const onBack = () => {
    dispatch(resetHarvestLog());
    history.push(isEdit.isEdit ? '/log' : '/new_log');
  };

  const onCancel = () => {
    dispatch(resetHarvestLog());
    history.push('/log');
  };

  const onNext = (data) => {
    dispatch(harvestLogData(data));
    let formValue = !isEditStepOne.isEditStepOne
      ? {
          activity_kind: 'harvest',
          date: data.defaultDate,
          crops: data.defaultCrop,
          locations: data.defaultField,
          notes: data.defaultNotes,
          quantity_kg: convertToMetric(data.defaultQuantity, unit, 'kg'),
        }
      : {
          activity_id: selectedLog.activity_id,
          activity_kind: 'harvest',
          date: data.defaultDate,
          crops: data.defaultCrop,
          locations: data.defaultField,
          notes: data.defaultNotes,
          quantity_kg: convertToMetric(data.defaultQuantity, unit, 'kg'),
        };
    dispatch(harvestFormData(formValue));
    dispatch(canEditStepOne(false));
    history.push('/harvest_use_type');
  };

  return (
    <>
      <PureHarvestLog
        onGoBack={onBack}
        onNext={onNext}
        onCancel={onCancel}
        locations={locations}
        crops={crops}
        unit={unit}
        defaultData={defaultData}
        isEdit={{ ...isEdit, ...isEditStepOne }}
        selectedLog={selectedLog}
        dispatch={dispatch}
      />
    </>
  );
}

export default HarvestLog;
