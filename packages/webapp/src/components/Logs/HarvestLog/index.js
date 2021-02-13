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

export default function PureHarvestLog({ onGoBack, onNext, fields, crops, unit, defaultData }) {
  const { t } = useTranslation();
  let [date, setDate] = useState(moment());
  let [field, setField] = useState(null);
  let [crop, setCrop] = useState(null);
  let [quantity, setQuantity] = useState(0);
  let [validQuantity, setValidQuantity] = useState(null);

  useEffect(() => {
    setDate(moment(defaultData.defaultDate));
    setField(defaultData.defaultField ? defaultData.defaultField : null);
    setCrop(defaultData.defaultCrop ? defaultData.defaultCrop : null);
    setQuantity(defaultData.defaultQuantity ? defaultData.defaultQuantity : null);
    setValidQuantity(isTwoDecimalPlaces(defaultData.defaultQuantity) ? true : false);
  }, []);

  let fieldOptions = fields.map(({ field_name, field_id }) => ({
    label: field_name,
    value: field_id,
  }));

  let cropOptions = crops.map(({ crop_common_name, crop_id }) => ({
    label: crop_common_name,
    value: crop_id,
  }));

  const { register, handleSubmit, watch, errors } = useForm({
    mode: 'onTouched',
  });

  const QUANTITY = 'quantity';
  const quant = watch(QUANTITY, undefined);
  const NOTES = 'notes';
  const notes = watch(NOTES, undefined);
  const required = watch(QUANTITY, false);
  const optional = watch(NOTES, false) || watch(NOTES, true);
  const refInputQuantity = register({ required: required });
  const refInputNotes = register({ required: optional });

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
    !isTwoDecimalPlaces(data.quantity) ? setValidQuantity(false) : setValidQuantity(true);
    if (validQuantity) {
      let selectedCrop = {
        label: crop.label,
        value: crops[0].field_crop_id,
      };
      onNext({
        defaultDate: date,
        defaultField: field,
        defaultCrop: selectedCrop,
        defaultQuantity: data.quantity,
        defaultNotes: data.notes,
        selectedUseTypes: [],
        // validQuantity: false,
      });
    }
  };

  const onError = (data) => {};

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
              onChange={setField}
              value={field}
              style={{ marginBottom: '24px' }}
              defaultValue={defaultData.defaultField}
            />
            {field && (
              <ReactSelect
                label={t('LOG_HARVEST.CROP')}
                placeholder={t('LOG_HARVEST.CROP_PLACEHOLDER')}
                options={cropOptions}
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
              inputRef={refInputQuantity}
              defaultValue={defaultData.defaultQuantity}
            />
            {errors[QUANTITY] && (
              <Error style={{ marginTop: '-20px', marginBottom: '30px' }}>
                {t('common:REQUIRED')}
              </Error>
            )}
            {!validQuantity ? (
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
                defaultValue={defaultData.defaultNotes}
              />
            </div>
          </TitleLayout>
        </div>
      </div>
    </Form>
  );
}
