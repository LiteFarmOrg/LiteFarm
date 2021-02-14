import React, { useEffect, useState } from 'react';
import PureHarvestAllocation from '../../../components/Logs/HarvestAllocation';
import {
  harvestLogDataSelector,
  harvestFormDataSelector,
  harvestLogData,
} from '../Utility/logSlice';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { userFarmSelector } from '../../userFarmSlice';
import { convertToMetric, getUnit } from '../../../util';
import { addLog, editLog } from '../Utility/actions';

function HarvestAllocation() {
  const dispatch = useDispatch();
  const farm = useSelector(userFarmSelector);
  let [unit, setUnit] = useState(getUnit(farm, 'kg', 'lb'));
  const defaultData = useSelector(harvestLogDataSelector);
  const [finalForm, setFinalForm] = useState({});
  const formData = useSelector(harvestFormDataSelector);

  useEffect(() => {}, []);

  const onBack = (data) => {
    history.push('/harvest_use_type');
  };

  const onNext = (data) => {
    const tempProps = {};
    tempProps.activity_kind = formData.activity_kind;
    tempProps.date = formData.date;
    tempProps.crops = [{ field_crop_id: formData.crops.value }];
    tempProps.fields = [{ field_id: formData.fields.value }];
    tempProps.notes = defaultData.defaultNotes;
    tempProps.quantity_kg =
      unit === 'lb'
        ? convertToMetric(defaultData.defaultQuantity, unit, 'kg')
        : defaultData.defaultQuantity;

    const useTypes = data.selectedUseTypes;
    defaultData.selectedUseTypes = useTypes;
    dispatch(harvestLogData(defaultData));

    dispatch(addLog(tempProps));
  };

  return (
    <>
      <PureHarvestAllocation
        onGoBack={onBack}
        onNext={onNext}
        defaultData={defaultData}
        unit={unit}
        finalForm={finalForm}
        setFinalForm={setFinalForm}
      />
    </>
  );
}

export default HarvestAllocation;
