import React, { useEffect } from 'react';
import PureHarvestUseType from '../../../components/Logs/HarvestUseType';
import { harvestLogDataSelector, harvestLogData } from '../Utility/logSlice';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { fieldsSelector } from '../../fieldSlice';
import { currentFieldCropsSelector } from '../../fieldCropSlice';
import { userFarmSelector } from '../../userFarmSlice';
import { addHarvestUseType } from '../actions';
import { setAllHarvestUseTypesSelector } from '../selectors';

function HarvestUseType() {
  const dispatch = useDispatch();
  const allUseType = useSelector(setAllHarvestUseTypesSelector);
  const defaultData = useSelector(harvestLogDataSelector);
  const farm = useSelector(userFarmSelector);

  useEffect(() => {}, []);

  const onBack = (data) => {
    const tempProps = JSON.parse(JSON.stringify(data));
    if (defaultData.selectedUseTypes.length > 0) {
      tempProps.selectedUseTypes.map((item, idx) => {
        if (
          idx < defaultData.selectedUseTypes.length &&
          item.harvest_use_type_name === defaultData.selectedUseTypes[idx].harvest_use_type_name
        ) {
          item.quantity_kg = defaultData.selectedUseTypes[idx].quantity_kg;
        }
      });
    }
    defaultData.selectedUseTypes = tempProps.selectedUseTypes;
    dispatch(harvestLogData(defaultData));
    history.push('/harvest_log');
  };

  const onNext = (data) => {
    const tempProps = JSON.parse(JSON.stringify(data));
    if (defaultData.selectedUseTypes.length > 0) {
      tempProps.selectedUseTypes.map((item, idx) => {
        if (
          idx < defaultData.selectedUseTypes.length &&
          item.harvest_use_type_name === defaultData.selectedUseTypes[idx].harvest_use_type_name
        ) {
          item.quantity_kg = defaultData.selectedUseTypes[idx].quantity_kg;
        }
      });
    }

    defaultData.selectedUseTypes = tempProps.selectedUseTypes;
    dispatch(harvestLogData(defaultData));
    history.push('/harvest_allocation');
  };

  const dispatchAddUseType = (useTypeName) => dispatch(addHarvestUseType(useTypeName));
  const showUseTypeRequiredError = () => toastr.error(t('message:LOG_HARVEST.REQUIRED_TASK'));

  const fields = useSelector(fieldsSelector);
  const crops = useSelector(currentFieldCropsSelector);

  return (
    <>
      <PureHarvestUseType
        onGoBack={onBack}
        onNext={onNext}
        useTypes={allUseType}
        defaultData={defaultData}
        farm={farm}
        addUseType={dispatchAddUseType}
        showUseTypeRequiredError={showUseTypeRequiredError}
      />
    </>
  );
}

export default HarvestUseType;
