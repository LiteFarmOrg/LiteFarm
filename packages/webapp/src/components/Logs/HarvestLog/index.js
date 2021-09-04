import React, { useEffect, useState } from 'react';
import TitleLayout from '../../Layout/TitleLayout';
import DateContainer from '../../Inputs/DateContainer';
import ReactSelect from '../../Form/ReactSelect';
import { Error, Semibold } from '../../Typography';
import moment from 'moment';
import Button from '../../Form/Button';
import styles from './styles.module.scss';
import Input from '../../Form/Input';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { convertFromMetric, getMass, roundToTwoDecimal } from '../../../util';
import ConfirmModal from '../../Modals/Confirm';

export default function PureHarvestLog({
  onGoBack,
  onCancel,
  onNext,
  locations,
  crops,
  unit,
  defaultData,
  isEdit,
  selectedLog,
  dispatch,
  onDelete,
}) {
  const { t } = useTranslation(['translation', 'crop', 'common']);
  const [showModal, setShowModal] = useState();
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

  let locationOptions = locations?.map(({ name, location_id }) => ({
    label: name,
    value: location_id,
  }));

  let cropOptions = crops?.map(
    ({ crop_translation_key, crop_id, location: { name: location_name, location_id } }) => ({
      label: t(`crop:${crop_translation_key}`),
      value: crop_id,
      location_name,
      location_id,
    }),
  );

  const {
    register,
    handleSubmit,
    watch,

    formState: { errors },
  } = useForm({
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
    return defaultData?.defaultField ? defaultData.defaultField : null;
  };

  const selectedCropValue = () => {
    if (isEdit.isEditStepOne) {
      return {
        label: selectedLog.managementPlan[0].crop.crop_common_name,
        value: selectedLog.managementPlan[0].management_plan_id,
      };
    }
    return defaultData.defaultCrop ? defaultData.defaultCrop : null;
  };

  const setDefaultCrop = () => {
    if (isEdit.isEditStepOne) {
      return {
        label: selectedLog.managementPlan[0].crop.crop_common_name,
        value: selectedLog.managementPlan[0].crop.crop_id,
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
        value = item.management_plan_id;
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
  };

  const handleCropChange = (crop) => {
    defaultData.resetCrop = false;
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
        onCancel={onCancel}
        title={isEdit?.isEdit ? t('LOG_COMMON.EDIT_A_LOG') : t('LOG_COMMON.ADD_A_LOG')}
        style={{ flexGrow: 9, order: 2 }}
        buttonGroup={
          <>
            {!!onDelete && (
              <Button
                onClick={() => setShowModal(true)}
                type={'button'}
                color={'secondary'}
                fullLength
              >
                {t('common:DELETE')}
              </Button>
            )}
            <Button type={'submit'} disabled={!location || !crop || !quant} fullLength>
              {isEdit?.isEdit ? t('common:UPDATE') : t('common:NEXT')}
            </Button>
          </>
        }
      >
        {!!onDelete && (
          <ConfirmModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={onDelete}
            message={t('LOG_COMMON.DELETE_CONFIRMATION')}
          />
        )}

        <Semibold style={{ marginBottom: '24px' }}>{t('LOG_HARVEST.TITLE')}</Semibold>
        <DateContainer date={date} onDateChange={setDate} label={t('common:DATE')} />
        <div style={{ marginTop: '24px' }} />
        <ReactSelect
          label={t('LOG_COMMON.LOCATION')}
          placeholder={t('LOG_COMMON.SELECT_LOCATION')}
          options={locationOptions}
          onChange={(e) => handleFieldChange(e)}
          value={location}
          style={{ marginBottom: '24px' }}
          defaultValue={defaultData?.defaultField}
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
          type="number"
          unit={unit}
          step={0.01}
          hookFormRegister={register(QUANTITY, {
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
          <Input
            label={t('common:NOTES')}
            optional
            hookFormRegister={register(NOTES, { required: optional })}
            defaultValue={!isEdit.isEditStepOne ? defaultData.defaultNotes : selectedLog.notes}
          />
        </div>
      </TitleLayout>
    </form>
  );
}
