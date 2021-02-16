import React, { useEffect } from 'react';
import TitleLayout from '../../Layout/TitleLayout';
import { Semibold } from '../../Typography';
import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import Input from '../../Form/Input';
import { convertToMetric } from '../../../util';
import { toastr } from 'react-redux-toastr';
import { harvestLogData } from '../../../containers/Log/Utility/logSlice';

export default function PureHarvestAllocation({
  onGoBack,
  onNext,
  defaultData,
  unit,
  isEdit,
  selectedLog,
  dispatch,
}) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, errors, formState } = useForm({
    mode: 'onChange',
  });
  let inputs = defaultData.selectedUseTypes.map(() => register({ required: true }));
  const tempProps = JSON.parse(JSON.stringify(defaultData));

  useEffect(() => {}, []);

  const onSubmit = (val) => {
    let tempProps = JSON.parse(JSON.stringify(defaultData));
    tempProps.selectedUseTypes.map((obj) => {
      if (obj.harvest_use_type_name in val) {
        obj.quantity_kg = val[obj.harvest_use_type_name];
      }
    });

    let sum = Object.keys(val).reduce((sum, key) => sum + Number(val[key]), 0);

    if (
      sum >= Number(tempProps.defaultQuantity) - 0.1 &&
      sum < Number(tempProps.defaultQuantity) + 0.1
    ) {
      tempProps.selectedUseTypes.forEach((element) => {
        element.quantity_kg = convertToMetric(element.quantity_kg, unit, 'kg');
      });
      onNext(tempProps);
    } else {
      toastr.error('Total does not equal the amount to allocate');
    }
  };
  const handleChange = (typeName, quant) => {
    tempProps.selectedUseTypes.map((item) => {
      if (typeName === item.harvest_use_type_name) {
        item.quantity_kg = quant;
      }
    });
    dispatch(harvestLogData(tempProps));
  };

  const onError = () => {};

  const onBack = () => {
    if (isEdit.isEditStepThree) {
      tempProps.selectedUseTypes.map((item, idx) => {
        selectedLog.harvestUse.map((item1) => {
          if (item.harvest_use_type_name === item1.harvestUseType.harvest_use_type_name) {
            item.quantity_kg = item.quantity_kg ? item.quantity_kg : item1.quantity_kg;
          }
        });
      });
    }
    dispatch(harvestLogData(tempProps));
    onGoBack(tempProps);
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button onClick={onBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength disabled={!formState.isValid}>
            {t('common:NEXT')}
          </Button>
        </>
      }
    >
      <div>
        <div style={{ marginLeft: '-20px', minWidth: '370px' }}>
          <TitleLayout
            onGoBack={onBack}
            title={t('LOG_HARVEST.HARVEST_ALLOCATION_TITLE')}
            style={{ flexGrow: 9, order: 2 }}
          >
            <Semibold>{t('LOG_HARVEST.HARVEST_ALLOCATION_SUBTITLE')}</Semibold>
            <div style={{ color: '#085D50', fontWeight: 'bold' }}>
              <p>{defaultData.defaultQuantity + unit}</p>
            </div>
            {defaultData.selectedUseTypes.map((type, index) => {
              const typeName = t(`harvest_uses:${type.harvest_use_type_translation_key}`);
              let quant = type.quantity_kg;
              return (
                <div
                  style={
                    index === defaultData.selectedUseTypes.length - 1
                      ? { marginBottom: '100px', paddingTop: '20px' }
                      : { paddingTop: '20px' }
                  }
                >
                  <Input
                    label={typeName}
                    style={{ marginBottom: '24px' }}
                    type="decimal"
                    unit={unit}
                    name={typeName}
                    onChange={(e) => handleChange(typeName, e.target.value)}
                    inputRef={inputs[index]}
                    defaultValue={quant}
                  />
                </div>
              );
            })}
          </TitleLayout>
        </div>
      </div>
    </Form>
  );
}
