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
  const { t } = useTranslation();
  const allUseType = useSelector(setAllHarvestUseTypesSelector);
  const defaultData = useSelector(harvestLogDataSelector);
  const farm = useSelector(userFarmSelector);
  const isEditStepTwo = useSelector(canEditStepTwoSelector);
  const selectedLog = useSelector(currentLogSelector);

  const onBack = (data) => {
    dispatch(canEditStepTwo(false));
    const tempProps = JSON.parse(JSON.stringify(data));

    if (defaultData.selectedUseTypes.length > 0) {
      const defaultQuantities = defaultData.selectedUseTypes.reduce((obj, item) => {
        let name = isEditStepTwo.isEditStepTwo
          ? item.harvestUseType.harvest_use_type_name
          : item.harvest_use_type_name;
        return { ...obj, [name]: item.quantity_kg };
      });
      tempProps.selectedUseTypes.map((item) => ({
        ...item,
        quantity_kg: defaultQuantities[item.harvest_use_type_name]
          ? defaultQuantities[item.harvest_use_type_name]
          : item.quantity_kg,
      }));
    }
    dispatch(harvestLogData({ ...defaultData, selectedUseTypes: tempProps.selectedUseTypes }));
    history.push('/harvest_log');
  };

  const onNext = (data) => {
    let newData;
    if (isEditStepTwo.isEditStepTwo) {
      const defaultQuantities = defaultData.selectedUseTypes.reduce((obj, item) => {
        let name = item.harvestUseType.harvest_use_type_name;
        return { ...obj, [name]: item.quantity_kg };
      });
      const newData = data.selectedUseTypes.map((item) => ({
        ...item,
        quantity_kg: defaultQuantities[item.harvest_use_type_name]
          ? defaultQuantities[item.harvest_use_type_name]
          : item.quantity_kg,
      }));
      dispatch(canEditStepTwo(false));
      dispatch(harvestLogData({ ...defaultData, selectedUseTypes: newData }));
    } else {
      const tempProps = JSON.parse(JSON.stringify(data));
      console.log(defaultData.selectedUseTypes);
      if (defaultData.selectedUseTypes.length > 0) {
        const defaultQuantities = defaultData.selectedUseTypes.reduce((obj, item) => {
          let name = item.harvest_use_type_name
            ? item.harvest_use_type_name
            : item.harvestUseType.harvest_use_type_name;
          return { ...obj, [name]: item.quantity_kg };
        });
        newData = tempProps.selectedUseTypes.map((item) => ({
          ...item,
          quantity_kg: defaultQuantities[item.harvest_use_type_name]
            ? defaultQuantities[item.harvest_use_type_name]
            : item.quantity_kg,
        }));
      }
      dispatch(
        harvestLogData({
          ...defaultData,
          selectedUseTypes: !newData ? tempProps.selectedUseTypes : newData,
        }),
      );
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
