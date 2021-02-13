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

  useEffect(() => {
    let mutateFinalForm = {};
    for (let useType of defaultData.selectedUseTypes) {
      mutateFinalForm[useType.harvest_use_type_name] = 0;
    }
    setFinalForm(mutateFinalForm);
  }, []);

  const onSubmit = (val) => {
    const tempProps = JSON.parse(JSON.stringify(defaultData));
    tempProps.selectedUseTypes.map((obj) => {
      if (obj.harvest_use_type_name in val) {
        obj.quantity_kg = val[obj.harvest_use_type_name];
      }
    });
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

  const onError = () => {};

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
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
                    onChange={setFinalForm}
                    inputRef={register()}
                    //   defaultValue={defaultData.defaultQuantity}
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
