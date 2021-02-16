import React, { useEffect } from 'react';
import PureHarvestUseType from '../../../components/Logs/HarvestUseType';
import {
  harvestLogDataSelector,
  harvestLogData,
  canEditStepTwo,
  canEditStepTwoSelector,
} from '../Utility/logSlice';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { userFarmSelector } from '../../userFarmSlice';
import { addHarvestUseType } from '../actions';
import { setAllHarvestUseTypesSelector } from '../selectors';
import { currentLogSelector } from '../selectors';

function HarvestUseType() {
  const dispatch = useDispatch();
  const allUseType = useSelector(setAllHarvestUseTypesSelector);
  const defaultData = useSelector(harvestLogDataSelector);
  const farm = useSelector(userFarmSelector);
  const isEditStepTwo = useSelector(canEditStepTwoSelector);
  const selectedLog = useSelector(currentLogSelector);

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
    dispatch(canEditStepTwo(false));
    dispatch(harvestLogData(defaultData));
    history.push('/harvest_log');
  };

  const onNext = (data) => {
    const tempProps = JSON.parse(JSON.stringify(data));
    if (defaultData.selectedUseTypes.length > 0) {
      if (defaultData.selectedUseTypes.length > 0) {
        tempProps.selectedUseTypes.map((item, idx) => {
          defaultData.selectedUseTypes.map((item1) => {
            if (item.harvest_use_type_name === item1.harvest_use_type_name) {
              item.quantity_kg = item1.quantity_kg;
            }
          });
        });
      }
    }

    defaultData.selectedUseTypes = tempProps.selectedUseTypes;
    dispatch(harvestLogData(defaultData));
    dispatch(canEditStepTwo(false));
    history.push('/harvest_allocation');
  };

  const dispatchAddUseType = (useTypeName) => dispatch(addHarvestUseType(useTypeName));
  const showUseTypeRequiredError = () => toastr.error(t('message:LOG_HARVEST.REQUIRED_TASK'));

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
        isEdit={isEditStepTwo}
        selectedLog={selectedLog}
      />
    </>
  );
}

export default HarvestUseType;
