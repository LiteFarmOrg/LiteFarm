import React, { useEffect, useState } from 'react';
import TitleLayout from '../../Layout/TitleLayout';
import DateContainer from '../../Inputs/DateContainer';
import ReactSelect from '../../Form/ReactSelect';
import { Error } from '../../Typography';
import TextArea from '../../../components/Form/TextArea';
import moment from 'moment';
import Button from '../../Form/Button';
import styles from './styles.module.scss';
import Input from '../../Form/Input';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { harvestLogData } from '../../../containers/Log/Utility/logSlice';
import { convertFromMetric, getMass, roundToTwoDecimal } from '../../../util';

export default function PureHarvestLog({
  onGoBack,
  onNext,
  locations,
  crops,
  unit,
  defaultData,
  isEdit,
  selectedLog,
  dispatch,
}) {
  const { t } = useTranslation(['translation', 'crop', 'common']);
  let [date, setDate] = useState(moment());
  let [location, setLocation] = useState(null);
  let [crop, setCrop] = useState(null);
  let [quantity, setQuantity] = useState(0);
  let [filteredCropOptions, setFilteredCropOptions] = useState([]);
  let [selectedCrop, setSelectedCrop] = useState({});
  useEffect(() => {
    setDate(setDefaultDate());
    setLocation(setDefaultField());
    setCrop(setDefaultCrop());
    setQuantity(setDefaultQuantity());
    setSelectedCrop(selectedCropValue);
    setFilteredCropOptions(setDefaultCropOptions);
  }, []);

  let locationOptions = locations.map(({ name, location_id }) => ({
    label: name,
    value: location_id,
  }));

  let cropOptions = crops.map(
    ({ crop_translation_key, crop_id, location: { name: location_name, location_id } }) => ({
      label: t(`crop:${crop_translation_key}`),
      value: crop_id,
      location_name,
      location_id,
    }),
  );

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
      return { label: selectedLog.location[0].name, value: selectedLog.location[0].location_id };
    }
    return defaultData.defaultField ? defaultData.defaultField : null;
  };

  const selectedCropValue = () => {
    if (isEdit.isEditStepOne) {
      return {
        label: selectedLog.fieldCrop[0].crop.crop_common_name,
        value: selectedLog.fieldCrop[0].field_crop_id,
      };
    }
    return defaultData.defaultCrop ? defaultData.defaultCrop : null;
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

  const setDefaultCropOptions = () => {
    if (isEdit.isEditStepOne) {
      let data = cropOptions.filter((e) => {
        return e.location_id === selectedLog.location[0].location_id;
      });
      setFilteredCropOptions(data);
    }
    return defaultData.filteredCropOptions ? defaultData.filteredCropOptions : null;
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
  const quant = watch(QUANTITY);
  const NOTES = 'notes';
  const notes = watch(NOTES, undefined);
  const optional = watch(NOTES, false) || watch(NOTES, true);
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
    const validQuantity = !!isTwoDecimalPlaces(data.quantity);
    dispatch(harvestLogData({ ...defaultData, validQuantity }));

    if (validQuantity) {
      const selectedUseTypes = defaultData?.selectedUseTypes?.length
        ? defaultData?.selectedUseTypes
        : selectedLog?.harvestUse?.map((harvestUse) => ({
            ...harvestUse,
            quantity_kg: roundToTwoDecimal(
              unit === 'lb' ? getMass(harvestUse.quantity_kg) : harvestUse.quantity_kg,
            ),
          }));

      onNext({
        defaultDate: date,
        defaultField: location,
        defaultCrop: selectedCrop,
        defaultQuantity: data.quantity,
        defaultNotes: data.notes,
        selectedUseTypes: selectedUseTypes ?? [],
        validQuantity: true,
        resetCrop: false,
        filteredCropOptions: filteredCropOptions,
      });
    }
  };

  const setCropValue = (crop) => {
    let value = 0;
    crops.map((item) => {
      if (item.crop_id === crop.value) {
        value = item.field_crop_id;
      }
    });
    return value;
  };

  const onError = (data) => {};

  const handleFieldChange = (location) => {
    defaultData.resetCrop = true;
    setLocation(location);
    let data = cropOptions.filter((cropOption) => {
      return cropOption.location_id === location.value;
    });
    setFilteredCropOptions(data);
    defaultData.filteredCropOptions = data;
    dispatch(harvestLogData(defaultData));
  };

  const handleCropChange = (crop) => {
    defaultData.resetCrop = false;
    dispatch(harvestLogData(defaultData));
    setCrop(crop);
    let data = {
      label: crop.label,
      value: setCropValue(crop),
    };
    setSelectedCrop(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}
    >
      <TitleLayout
        onGoBack={onGoBack}
        title={isEdit?.isEdit ? t('LOG_COMMON.EDIT_A_LOG') : t('LOG_COMMON.ADD_A_LOG')}
        style={{ flexGrow: 9, order: 2 }}
        buttonGroup={
          <>
            <Button onClick={onGoBack} color={'secondary'} fullLength>
              {t('common:CANCEL')}
            </Button>
            <Button type={'submit'} disabled={!location || !crop || !quant} fullLength>
              {t('common:NEXT')}
            </Button>
          </>
        }
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
          options={locationOptions}
          onChange={(e) => handleFieldChange(e)}
          value={location}
          style={{ marginBottom: '24px' }}
          defaultValue={defaultData.defaultField}
        />
        {location && (
          <ReactSelect
            label={t('LOG_HARVEST.CROP')}
            placeholder={t('LOG_HARVEST.CROP_PLACEHOLDER')}
            options={filteredCropOptions}
            onChange={(e) => handleCropChange(e)}
            value={defaultData.resetCrop ? null : crop}
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
          inputRef={register({
            required: true,
          })}
          defaultValue={setDefaultQuantity()}
        />
        {errors[QUANTITY] && (
          <Error style={{ marginTop: '-20px', marginBottom: '30px' }}>{t('common:REQUIRED')}</Error>
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
    </form>
  );
}
