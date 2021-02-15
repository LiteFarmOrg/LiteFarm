import React, { useEffect, useState } from 'react';
import TitleLayout from '../../Layout/TitleLayout';
import DateContainer from '../../Inputs/DateContainer';
import ReactSelect from '../../Form/ReactSelect';
import { Error } from '../../Typography';
import TextArea from '../../../components/Form/TextArea';
import moment from 'moment';
import Button from '../../Form/Button';
import Form from '../../Form';
import styles from './styles.scss';
import Input from '../../Form/Input';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { harvestLogData } from '../../../containers/Log/Utility/logSlice';
import { convertFromMetric, roundToTwoDecimal } from '../../../util';

export default function PureHarvestLog({
  onGoBack,
  onNext,
  fields,
  crops,
  unit,
  defaultData,
  isEdit,
  selectedLog,
  dispatch,
}) {
  const { t } = useTranslation();
  let [date, setDate] = useState(moment());
  let [field, setField] = useState(null);
  let [crop, setCrop] = useState(null);
  let [cropID, setCropID] = useState(0);
  let [quantity, setQuantity] = useState(0);
  let [filteredCropOptions, setFilteredCropOptions] = useState([]);

  useEffect(() => {
    setDate(setDefaultDate());
    setField(setDefaultField());
    setCrop(setDefaultCrop());
    setQuantity(setDefaultQuantity());
  }, []);

  let fieldOptions = fields.map(({ field_name, field_id }) => ({
    label: field_name,
    value: field_id,
  }));

  let cropOptions = crops.map(({ crop_common_name, crop_id, field_name }) => ({
    label: crop_common_name,
    value: crop_id,
    field_name: field_name,
  }));

  const { register, handleSubmit, watch, errors } = useForm({
    mode: 'onTouched',
  });

  const setDefaultDate = () => {
    if (isEdit.isEditStepOne) {
      return moment(selectedLog.date);
    }
    return moment(defaultData.defaultDate);
  };

  const setDefaultField = () => {
    if (isEdit.isEditStepOne) {
      return { label: selectedLog.field[0].field_name, value: selectedLog.field[0].field_id };
    }
    return defaultData.defaultField ? defaultData.defaultField : null;
  };

  const setDefaultCrop = () => {
    if (isEdit.isEditStepOne) {
      return {
        label: selectedLog.fieldCrop[0].crop.crop_common_name,
        value: selectedLog.fieldCrop[0].crop.crop_id,
      };
    }
    return defaultData.defaultCrop ? defaultData.defaultCrop : null;
  };

  const setDefaultQuantity = () => {
    if (isEdit.isEditStepOne) {
      if (unit === 'lb') {
        return roundToTwoDecimal(
          convertFromMetric(selectedLog.harvestLog.quantity_kg, unit, 'kg'),
        ).toString();
      }
      return roundToTwoDecimal(selectedLog.harvestLog.quantity_kg).toString();
    }
    return defaultData.defaultQuantity ? defaultData.defaultQuantity : null;
  };

  const QUANTITY = 'quantity';
  const quant = watch(QUANTITY, undefined);
  const NOTES = 'notes';
  const notes = watch(NOTES, undefined);
  const required = watch(QUANTITY, false);
  const optional = watch(NOTES, false) || watch(NOTES, true);
  const refInputQuantity = register({ required: required });
  const refInputNotes = register({ required: optional });
  const QUANTITY_VALID = 'quantityValid';

  const isTwoDecimalPlaces = (val) => {
    let decimals;
    if (val) {
      const decimalIndex = val.toString().indexOf('.');
      val = val.toString();
      if (decimalIndex > -1) {
        decimals = val.split('.')[1].length;
      }
    }

    return !decimals || decimals < 3;
  };

  const onSubmit = (data) => {
    if (isTwoDecimalPlaces(data.quantity)) {
      defaultData.validQuantity = true;
      dispatch(harvestLogData(defaultData));
    } else {
      defaultData.validQuantity = false;
      dispatch(harvestLogData(defaultData));
    }
    if (defaultData.validQuantity) {
      let selectedCrop = {
        label: crop.label,
        value: setCropValue(),
      };
      onNext({
        defaultDate: date,
        defaultField: field,
        defaultCrop: selectedCrop,
        defaultQuantity: data.quantity,
        defaultNotes: data.notes,
        selectedUseTypes: [],
        validQuantity: true,
      });
    }
  };

  const setCropValue = () => {
    let value = 0;
    crops.map((item) => {
      if (item.crop_id === crop.value) {
        value = item.field_crop_id;
      }
    });
    return value;
  };

  const onError = (data) => {};

  const handleChange = (field) => {
    setField(field);
    let data = cropOptions.filter((e) => {
      return e.field_name === field.label;
    });
    setFilteredCropOptions(data);
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} disabled={!field || !crop || !quant} fullLength>
            {t('common:NEXT')}
          </Button>
        </>
      }
    >
      <div classname={styles.logContainer}>
        <div style={{ marginLeft: '-20px', minWidth: '370px' }}>
          <TitleLayout
            onGoBack={onGoBack}
            title={t('LOG_HARVEST.TITLE')}
            onGoBack={onGoBack}
            style={{ flexGrow: 9, order: 2 }}
          >
            <DateContainer
              date={date}
              onDateChange={setDate}
              placeholder={t('LOG_COMMON.CHOOSE_DATE')}
            />
            <div style={{ marginTop: '24px' }} />
            <ReactSelect
              label={t('LOG_HARVEST.FIELD')}
              placeholder={t('LOG_HARVEST.FIELD_PLACEHOLDER')}
              options={fieldOptions}
              onChange={(e) => handleChange(e)}
              value={field}
              style={{ marginBottom: '24px' }}
              defaultValue={defaultData.defaultField}
            />
            {field && (
              <ReactSelect
                label={t('LOG_HARVEST.CROP')}
                placeholder={t('LOG_HARVEST.CROP_PLACEHOLDER')}
                options={filteredCropOptions}
                // options={cropOptions.filter((el) => {
                //   return
                // })}
                onChange={setCrop}
                value={crop}
                style={{ marginBottom: '24px' }}
                defaultValue={defaultData.defaultCrop}
              />
            )}
            <Input
              label={t('LOG_COMMON.QUANTITY')}
              style={{ marginBottom: '24px' }}
              type="decimal"
              unit={unit}
              name={QUANTITY}
              onChange={setQuantity}
              // inputRef={refInputQuantity}
              inputRef={register({
                required: true,
                pattern: isTwoDecimalPlaces,
              })}
              defaultValue={setDefaultQuantity()}
            />
            {errors[QUANTITY] && (
              <Error style={{ marginTop: '-20px', marginBottom: '30px' }}>
                {t('common:REQUIRED')}
              </Error>
            )}
            {!defaultData.validQuantity ? (
              <Error style={{ marginTop: '-20px', marginBottom: '30px' }}>
                {t('LOG_HARVEST.QUANTITY_ERROR')}
              </Error>
            ) : (
              ''
            )}
            <div className={styles.noteContainer}>
              <TextArea
                label={t('common:NOTES')}
                name={NOTES}
                inputRef={refInputNotes}
                defaultValue={!isEdit.isEditStepOne ? defaultData.defaultNotes : selectedLog.notes}
              />
            </div>
          </TitleLayout>
        </div>
      </div>
    </Form>
  );
}
