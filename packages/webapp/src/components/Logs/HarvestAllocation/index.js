import React, { useEffect, useState } from 'react';
import TitleLayout from '../../Layout/TitleLayout';
import { Semibold } from '../../Typography';
import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import Input from '../../Form/Input';
import { convertToMetric, roundToTwoDecimal, convertFromMetric } from '../../../util';
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
  canConvertQuantity,
  convertQuantity,
}) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, errors, formState } = useForm({
    mode: 'onTouched',
  });
  const tempProps = JSON.parse(JSON.stringify(defaultData));
  const [nextEnabled, setNextEnabled] = useState(false);

  useEffect(() => {
    const allFieldsFilledOut = () => {
      defaultData.selectedUseTypes.map((item) => {
        if (item.quantity_kg === '') {
          return false;
        }
      });
      return true;
    };
    setNextEnabled(allFieldsFilledOut);
  }, []);

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
    dispatch(canConvertQuantity(false));
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

  const setDefaultQuantity = (typeName) => {
    let quant = '';
    if (isEdit.isEditStepThree) {
      selectedLog.harvestUse.map((item) => {
        if (item.harvestUseType.harvest_use_type_name === typeName) {
          if (unit === 'lb') {
            quant = roundToTwoDecimal(convertFromMetric(item.quantity_kg, unit, 'kg')).toString();
          } else {
            quant = roundToTwoDecimal(item.quantity_kg).toString();
          }
        }
      });
      return quant;
    } else {
      defaultData.selectedUseTypes.map((item) => {
        if (item.harvest_use_type_name === typeName) {
          if (!item.quantity_kg) return null;
          if (unit === 'lb' && convertQuantity.convertQuantity) {
            quant = roundToTwoDecimal(convertFromMetric(item.quantity_kg, unit, 'kg')).toString();
          } else {
            quant = roundToTwoDecimal(item.quantity_kg);
          }
        }
      });
      return quant;
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button onClick={onBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength disabled={!nextEnabled}>
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
              let quant = setDefaultQuantity(typeName);
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
