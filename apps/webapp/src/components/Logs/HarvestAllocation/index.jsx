import React from 'react';
import TitleLayout from '../../Layout/TitleLayout';
import { Semibold } from '../../Typography';
import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Input, { getInputErrors } from '../../Form/Input';
import { convertToMetric } from '../../../util';
import { enqueueErrorSnackbar } from '../../../containers/Snackbar/snackbarSlice';

export default function PureHarvestAllocation({
  onGoBack,
  onNext,
  defaultData,
  unit,
  dispatch,
  isEdit,
}) {
  const { t } = useTranslation(['translation', 'message', 'common', 'harvest_uses']);
  const getDefaultValues = () => {
    const defaultValues = {};
    for (const type of defaultData.selectedUseTypes) {
      const key = type.harvest_use_type_name;
      const value =
        (defaultData.selectedUseTypes.length === 1 && defaultData.defaultQuantity) ||
        type.quantity ||
        '';
      defaultValues[key] = value;
    }
    return defaultValues;
  };
  const { register, handleSubmit, watch, formState } = useForm({
    mode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  const { errors } = formState;

  const tempProps = JSON.parse(JSON.stringify(defaultData));

  const onSubmit = (val) => {
    let tempProps = JSON.parse(JSON.stringify(defaultData));
    tempProps.selectedUseTypes.map((obj) => {
      if (obj.harvest_use_type_name in val) {
        obj.quantity = val[obj.harvest_use_type_name];
      }
    });

    let sum = Object.keys(val).reduce((sum, key) => sum + Number(val[key]), 0);

    if (
      sum >= Number(tempProps.defaultQuantity) - 0.1 &&
      sum < Number(tempProps.defaultQuantity) + 0.1
    ) {
      tempProps.selectedUseTypes.forEach((element) => {
        element.quantity = convertToMetric(element.quantity, unit, 'kg');
      });
      onNext(tempProps);
    } else {
      dispatch(enqueueErrorSnackbar(t('message:LOG_HARVEST.ERROR.AMOUNT_TOTAL')));
    }
  };
  const handleChange = (typeName, quant) => {
    tempProps.selectedUseTypes.map((item) => {
      if (typeName === item.harvest_use_type_name) {
        item.quantity = quant;
      }
    });
  };

  const onError = () => {};

  const onBack = () => {
    onGoBack(tempProps);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}
    >
      <TitleLayout
        onGoBack={onBack}
        title={isEdit?.isEdit ? t('LOG_COMMON.EDIT_A_LOG') : t('LOG_COMMON.ADD_A_LOG')}
        style={{ flexGrow: 9, order: 2 }}
        buttonGroup={
          <>
            <Button onClick={onBack} color={'secondary'} fullLength>
              {t('common:BACK')}
            </Button>
            <Button type={'submit'} fullLength disabled={!formState.isValid}>
              {isEdit?.isEdit ? t('common:UPDATE') : t('common:NEXT')}
            </Button>
          </>
        }
      >
        <Semibold>{t('LOG_HARVEST.HARVEST_ALLOCATION_SUBTITLE')}</Semibold>
        <div style={{ color: '#085D50', fontWeight: 'bold' }}>
          <p>{defaultData.defaultQuantity + unit}</p>
        </div>
        {defaultData.selectedUseTypes.map((type, index) => {
          const typeName = t(`harvest_uses:${type.harvest_use_type_translation_key}`);
          const quant = type.quantity;
          return (
            <div
              key={index}
              style={
                index === defaultData.selectedUseTypes.length - 1
                  ? { marginBottom: '100px', paddingTop: '20px' }
                  : { paddingTop: '20px' }
              }
            >
              <Input
                label={typeName}
                style={{ marginBottom: '24px' }}
                type="number"
                unit={unit}
                step={0.01}
                onChange={(e) => handleChange(typeName, e.target.value)}
                hookFormRegister={register(type.harvest_use_type_name, { required: true })}
                errors={getInputErrors(errors, type.harvest_use_type_name)}
              />
            </div>
          );
        })}
      </TitleLayout>
    </form>
  );
}
