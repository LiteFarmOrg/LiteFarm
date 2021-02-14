import React, { useEffect, useState } from 'react';
import TitleLayout from '../../Layout/TitleLayout';
import { Semibold } from '../../Typography';
import Button from '../../Form/Button';
import styles from './styles.scss';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import Input from '../../Form/Input';
import { convertToMetric, getUnit } from '../../../util';
import { toastr } from 'react-redux-toastr';
import { harvestLogData } from '../../../containers/Log/Utility/logSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function PureHarvestAllocation({
  onGoBack,
  onNext,
  defaultData,
  unit,
  finalForm,
  setFinalForm,
}) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, errors } = useForm({
    mode: 'onTouched',
  });
  const tempProps = JSON.parse(JSON.stringify(defaultData));
  const dispatch = useDispatch();

  useEffect(() => {
    let mutateFinalForm = {};
    for (let useType of defaultData.selectedUseTypes) {
      mutateFinalForm[useType.harvest_use_type_name] = 0;
    }
    setFinalForm(mutateFinalForm);
  }, []);

  const onSubmit = (val) => {
    const tempProps = JSON.parse(JSON.stringify(defaultData));
    let sum = Object.keys(val).reduce((sum, key) => sum + Number(val[key]), 0);

    if (
      sum >= Number(tempProps.defaultQuantity) - 0.01 &&
      sum < Number(tempProps.defaultQuantity) + 0.01
    ) {
      // if (!!this.props.formValue?.activity_id) {
      //   this.props.dispatch(editLog(this.props.formValue));
      // } else {
      tempProps.selectedUseTypes.forEach((element) => {
        element.quantity_kg = convertToMetric(element.quantity_kg, unit, 'kg');
      });
      onNext(tempProps);
      // }
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
          <Button type={'submit'} fullLength>
            {t('common:NEXT')}
          </Button>
        </>
      }
    >
      <div classname={styles.logContainer}>
        <div style={{ marginLeft: '-20px', minWidth: '370px' }}>
          <TitleLayout
            onGoBack={onGoBack}
            title={t('LOG_HARVEST.HARVEST_ALLOCATION_TITLE')}
            onGoBack={onGoBack}
            style={{ flexGrow: 9, order: 2 }}
          >
            <Semibold>{t('LOG_HARVEST.HARVEST_ALLOCATION_SUBTITLE')}</Semibold>
            <div style={{ color: '#085D50', fontWeight: 'bold' }}>
              <p>{defaultData.defaultQuantity + unit}</p>
            </div>
            {defaultData.selectedUseTypes.map((type, index) => {
              const typeName = t(`harvest_uses:${type.harvest_use_type_translation_key}`);
              const quant = type.quantity_kg ? type.quantity_kg : null;
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
                    inputRef={register()}
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
