import React from 'react';
import PureHarvestUseType from '../../../components/Logs/HarvestUseType';
import {
  canEditStepTwo,
  canEditStepTwoSelector,
  harvestLogData,
  harvestLogDataSelector,
} from '../Utility/logSlice';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { userFarmSelector } from '../../userFarmSlice';
import { addHarvestUseType } from '../actions';
import { currentLogSelector, setAllHarvestUseTypesSelector } from '../selectors';
import { toastr } from 'react-redux-toastr';
import { useTranslation } from 'react-i18next';

function HarvestUseType() {
  const dispatch = useDispatch();
  const { t } = useTranslation(['translation', 'message']);
  const allUseType = useSelector(setAllHarvestUseTypesSelector);
  const defaultData = useSelector(harvestLogDataSelector);
  const farm = useSelector(userFarmSelector);
  const isEditStepTwo = useSelector(canEditStepTwoSelector);
  const selectedLog = useSelector(currentLogSelector);

  const onBack = (data) => {
    dispatch(canEditStepTwo(false));
    const tempProps = JSON.parse(JSON.stringify(data));

    if (defaultData.selectedUseTypes.length > 0) {
      tempProps.selectedUseTypes.map((item) => {
        defaultData.selectedUseTypes.map((item1) => {
          let name = isEditStepTwo.isEditStepTwo
            ? item1.harvestUseType.harvest_use_type_name
            : item1.harvest_use_type_name;
          if (item.harvest_use_type_name === name) {
            item.quantity_kg = item1.quantity_kg;
          }
        });
      });
    }
    defaultData.selectedUseTypes = tempProps.selectedUseTypes;
    dispatch(harvestLogData(defaultData));
    history.push('/harvest_log');
  };

  const onNext = (data) => {
    if (isEditStepTwo.isEditStepTwo) {
      data.selectedUseTypes.map((item) => {
        defaultData.selectedUseTypes.map((item1) => {
          if (item.harvest_use_type_name === item1.harvestUseType.harvest_use_type_name) {
            item.quantity_kg = item1.quantity_kg;
          }
        });
      });
      defaultData.selectedUseTypes = data.selectedUseTypes;
      dispatch(canEditStepTwo(false));
      dispatch(harvestLogData(defaultData));
    } else {
      const tempProps = JSON.parse(JSON.stringify(data));
      if (defaultData.selectedUseTypes.length > 0) {
        tempProps.selectedUseTypes.map((item) => {
          defaultData.selectedUseTypes.map((item1) => {
            let name = item1.harvest_use_type_name
              ? item1.harvest_use_type_name
              : item1.harvestUseType.harvest_use_type_name;
            if (item.harvest_use_type_name === name) {
              item.quantity_kg = item1.quantity_kg;
            }
          });
        });
      }
      defaultData.selectedUseTypes = tempProps.selectedUseTypes;

      dispatch(harvestLogData(defaultData));
    }

    history.push('/harvest_allocation');
  };

  const dispatchAddUseType = (useTypeName) => dispatch(addHarvestUseType(useTypeName));
  const showUseTypeRequiredError = () => toastr.error(t('message:LOG_HARVEST.ERROR.REQUIRED_TASK'));

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
