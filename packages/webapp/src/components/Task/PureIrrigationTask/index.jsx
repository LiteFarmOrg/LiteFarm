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
import Unit from '../../Form/Unit';
import { waterUsage } from '../../../util/convert-units/unit';
import CancelFlowModal from '../../Modals/CancelFlowModal';
import PropTypes from 'prop-types';
import WaterUsageCalculatorModal from '../../Modals/WaterUsageCalculatorModal';

export default function PureIrrigationTask({
  handleGoBack,
  handleContinue,
  system,
  persistedFormData,
  useHookFormPersist,
}) {
  const [irrigationTypeValue, setIrrigationTypeValue] = useState();
  const [showWaterUseCalculatorModal, setShowWaterUseCalculatorModal] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [totalWaterUsage, setTotalWaterUsage] = useState();

  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      measurement_type: '',
      ...persistedFormData,
    },
  });

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
  const NOTES = 'notes';
  const disabled = !isValid;
  const { historyCancel } = useHookFormPersist(getValues);

  const onDismissWaterUseCalculatorModel = () => setShowWaterUseCalculatorModal(false);
  const handleModalSubmit = () => {
    setValue(ESTIMATED_WATER_USAGE, totalWaterUsage);
    onDismissWaterUseCalculatorModel();
  };

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(handleContinue)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={handleGoBack}
        onCancel={historyCancel}
        value={71}
        title={t('ADD_TASK.ADD_A_TASK')}
        cancelModalTitle={t('ADD_TASK.CANCEL')}
      />
      <Main
        style={{ marginBottom: '16px' }}
        tooltipContent={
          <>
            {t('ADD_TASK.IRRIGATION_VIEW.BRAND_TOOLTIP.FIRST_PHRASE')}{' '}
            <Underlined onClick={() => setShowConfirmCancelModal(true)}>
              {t('ADD_TASK.FIELD_WORK_VIEW.FIELD_WORK_TASK')}
            </Underlined>
            {t('ADD_TASK.IRRIGATION_VIEW.BRAND_TOOLTIP.LAST_PHRASE')}{' '}
          </>
        }
      >
        {t('ADD_TASK.IRRIGATION_VIEW.TELL_US_ABOUT_YOUR_IRRIGATION_TASK')}
      </Main>

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
          style={{ marginTop: '15px' }}
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
        style={{ marginTop: '10px', marginBottom: '25px' }}
        hookFormRegister={register(DEFAULT_IRRIGATION_TASK_LOCATION)}
      />
      <Label
        className={styles.label}
        style={{ marginBottom: '12px', marginTop: '10px', fontSize: '16px' }}
      >
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
        style={{ marginBottom: '24px' }}
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
      />

      <Label>
        {t('ADD_TASK.IRRIGATION_VIEW.NOT_SURE')}{' '}
        <Underlined onClick={() => setShowWaterUseCalculatorModal(true)}>
          {t('ADD_TASK.IRRIGATION_VIEW.CALCULATE_WATER_USAGE')}
        </Underlined>
      </Label>

      <InputAutoSize
        label={t('LOG_COMMON.NOTES')}
        optional
        hookFormRegister={register(NOTES, {
          maxLength: { value: 10000, message: t('ADD_TASK.TASK_NOTES_CHAR_LIMIT') },
        })}
        style={{ paddingTop: '20px' }}
        name={NOTES}
        errors={errors[NOTES]?.message}
      />

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

      {showConfirmCancelModal && (
        <CancelFlowModal
          dismissModal={() => setShowConfirmCancelModal(false)}
          handleCancel={historyCancel}
          flow={t('ADD_TASK.CANCEL')}
        />
      )}
    </Form>
  );
}

PureIrrigationTask.propTypes = {
  handleGoBack: PropTypes.func,
  handleContinue: PropTypes.func,
  system: PropTypes.string,
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
};
