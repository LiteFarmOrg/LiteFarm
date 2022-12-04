import React, { useState } from 'react';
import { Label, Main, Underlined } from '../../Typography';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import Form from '../../Form';
import { Controller, useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import ReactSelect from '../../Form/ReactSelect';
import Checkbox from '../../Form/Checkbox';
import RadioGroup from '../../Form/RadioGroup';
import styles from '../../Typography/typography.module.scss';
import Input from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import Unit, { getUnitOptionMap } from '../../Form/Unit';
import { waterUsage } from '../../../util/convert-units/unit';
import CancelFlowModal from '../../Modals/CancelFlowModal';
import PropTypes from 'prop-types';
import WaterUsageCalculatorModal from '../../Modals/WaterUsageCalculatorModal';
import { convert } from '../../../util/convert-units/convert';

export default function PureIrrigationTask({
  system,
  products,
  register,
  control,
  setValue,
  getValues,
  formState,
  watch,
  farm,
  disabled = false,
}) {
  const [irrigationTypeValue, setIrrigationTypeValue] = useState();
  const [showWaterUseCalculatorModal, setShowWaterUseCalculatorModal] = useState(false);
  const [totalWaterUsage, setTotalWaterUsage] = useState();

  const { t } = useTranslation();

  const { estimated_water_usage_unit, estimated_water_usage } = getValues();

  const stateController = () => {
    return { register, getValues, watch, control, setValue };
  };

  const IrrigationTypeOptions = [
    {
      label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.HAND_WATERING'),
      value: 'HAND_WATERING',
      default_measuring_type: 'VOLUME',
    },
    {
      label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.CHANNEL'),
      value: 'CHANNEL',
      default_measuring_type: 'VOLUME',
    },
    {
      label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.DRIP'),
      value: 'DRIP',
      default_measuring_type: 'VOLUME',
    },
    {
      label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.FLOOD'),
      value: 'FLOOD',
      default_measuring_type: 'VOLUME',
    },
    {
      label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.PIVOT'),
      value: 'PIVOT',
      default_measuring_type: 'DEPTH',
    },
    {
      label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.SPRINKLER'),
      value: 'SPRINKLER',
      default_measuring_type: 'DEPTH',
    },
    {
      label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.SUB_SURFACE'),
      value: 'SUB_SURFACE',
      default_measuring_type: 'VOLUME',
    },
    {
      label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.OTHER'),
      value: 'OTHER',
      default_measuring_type: null,
    },
  ];
  const IRRIGATION_TYPE = 'irrigation_task_type';
  const DEFAULT_IRRIGATION_TASK_LOCATION = 'set_default_irrigation_task_type_location';
  const DEFAULT_IRRIGATION_MEASUREMENT = 'set_default_irrigation_task_type_measurement';
  const CREATE_IRRIGATION_TYPE = 'irrigation_task_type_other';
  const MEASUREMENT_TYPE = 'measurement_type';
  const ESTIMATED_WATER_USAGE = 'estimated_water_usage';
  const ESTIMATED_WATER_USAGE_UNIT = 'estimated_water_usage_unit';

  const onDismissWaterUseCalculatorModel = () => setShowWaterUseCalculatorModal(false);
  const handleModalSubmit = () => {
    setValue(ESTIMATED_WATER_USAGE, totalWaterUsage);
    setValue(ESTIMATED_WATER_USAGE_UNIT, getUnitOptionMap()['l']);
    onDismissWaterUseCalculatorModel();
  };

  return (
    <>
      <Controller
        control={control}
        name={IRRIGATION_TYPE}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('ADD_TASK.IRRIGATION_VIEW.TYPE_OF_IRRIGATION')}
            options={IrrigationTypeOptions}
            onChange={(e) => {
              onChange(e);
              setIrrigationTypeValue(e.value);
              setValue(MEASUREMENT_TYPE, e.default_measuring_type);
            }}
            value={value}
          />
        )}
      />
      {(irrigationTypeValue === 'OTHER' ||
        getValues(IRRIGATION_TYPE)?.label === t('ADD_TASK.IRRIGATION_VIEW.TYPE.OTHER')) && (
        <Input
          style={{ marginTop: '6px' }}
          label={t('ADD_TASK.IRRIGATION_VIEW.WHAT_TYPE_OF_IRRIGATION')}
          hookFormRegister={register(CREATE_IRRIGATION_TYPE, {
            required: true,
            maxLength: {
              value: 100,
              message: t('ADD_TASK.IRRIGATION_VIEW.IRRIGATION_TYPE_CHAR_LIMIT'),
            },
          })}
        />
      )}
      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.SET_AS_DEFAULT_TYPE_FOR_THIS_LOCATION')}
        sm
        style={{ marginTop: '6px', marginBottom: '24px' }}
        hookFormRegister={register(DEFAULT_IRRIGATION_TASK_LOCATION)}
      />
      <Label className={styles.label} style={{ marginBottom: '4px', fontSize: '16px' }}>
        {t('ADD_TASK.IRRIGATION_VIEW.HOW_DO_YOU_MEASURE_WATER_USE_FOR_THIS_IRRIGATION_TYPE')}
      </Label>

      <RadioGroup
        required
        name={MEASUREMENT_TYPE}
        hookFormControl={control}
        radios={[
          {
            value: 'VOLUME',
            label: t('ADD_TASK.IRRIGATION_VIEW.VOLUME'),
            onChange: () => {
              setValue(MEASUREMENT_TYPE, 'VOLUME');
            },
          },
          {
            value: 'DEPTH',
            label: t('ADD_TASK.IRRIGATION_VIEW.DEPTH'),
            onChange: () => {
              setValue(MEASUREMENT_TYPE, 'DEPTH');
            },
          },
        ]}
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.SET_AS_DEFAULT_MEASUREMENT_FOR_THIS_IRRIGATION_TYPE')}
        sm
        style={{ marginBottom: '4px' }}
        hookFormRegister={register(DEFAULT_IRRIGATION_MEASUREMENT)}
      />

      <Unit
        register={register}
        displayUnitName={ESTIMATED_WATER_USAGE_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.ESTIMATED_WATER_USAGE')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={ESTIMATED_WATER_USAGE}
        unitType={waterUsage}
        max={999999999}
        system={system}
        control={control}
        style={{ marginTop: '15px' }}
        onChangeUnitOption={(e) => {
          if (e.label === 'l' && estimated_water_usage_unit.label === 'ml')
            setValue(ESTIMATED_WATER_USAGE, convert(estimated_water_usage).from('ml').to('l'));
          if (e.label === 'ml' && estimated_water_usage_unit.label === 'l')
            setValue(ESTIMATED_WATER_USAGE, convert(estimated_water_usage).from('l').to('ml'));
        }}
      />

      <Label style={{ marginTop: '4px' }}>
        {t('ADD_TASK.IRRIGATION_VIEW.NOT_SURE')}{' '}
        <Underlined onClick={() => setShowWaterUseCalculatorModal(true)}>
          {t('ADD_TASK.IRRIGATION_VIEW.CALCULATE_WATER_USAGE')}
        </Underlined>
      </Label>

      {showWaterUseCalculatorModal && getValues(MEASUREMENT_TYPE) && (
        <WaterUsageCalculatorModal
          dismissModal={onDismissWaterUseCalculatorModel}
          measurementType={getValues(MEASUREMENT_TYPE)}
          system={system}
          handleModalSubmit={handleModalSubmit}
          totalWaterUsage={totalWaterUsage}
          setTotalWaterUsage={setTotalWaterUsage}
          formState={stateController}
        />
      )}
    </>
  );
}

PureIrrigationTask.propTypes = {
  handleGoBack: PropTypes.func,
  handleContinue: PropTypes.func,
  system: PropTypes.string,
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
};
