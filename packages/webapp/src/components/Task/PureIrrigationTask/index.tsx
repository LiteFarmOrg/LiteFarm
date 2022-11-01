import React, { FC, useEffect, useState } from 'react';
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
import WaterUseCalculatorModal from '../../Modals/WaterUseCalculatorModal';
import Unit from '../../Form/Unit';
import { waterUsage } from '../../../util/convert-units/unit';

export interface ISystem {
  metric: {
    units: string[];
    defaultUnit: string;
    breakpoints: number[];
  };
  imperial: {
    units: string[];
    defaultUnit: string;
    breakpoints: number[];
  };
}
export interface IPureIrrigationTask {
  handleGoBack: () => void;
  persistedPaths: string[];
  system: ISystem;
}

const PureIrrigationTask: FC<IPureIrrigationTask> = ({ handleGoBack, ...props }) => {
  const [checkDefaultLocation, setCheckDefaultLocation] = useState<boolean>();
  const [checkDefaultMeasurement, setCheckDefaultMeasurement] = useState<boolean>();
  const [irrigationType, setIrrigationType] = useState<string>('');
  const [defaultMeasurementType, setDefaultMeasurementType] = useState<string>('');
  const [showWaterUseCalculatorModal, setShowWaterUseCalculatorModal] = useState<boolean>(false);
  const [totalWaterUsage, setTotalWaterUsage] = useState<number>(0);
  const [isDepthDefaultMeasurementType, setIsDepthDefaultMeasurementType] =
    useState<boolean>(false);
  const [isVolumeDefaultMeasurementType, setIsVolumeDefaultMeasurementType] =
    useState<boolean>(false);

  const onCheckDefaultLocation = () => setCheckDefaultLocation(!checkDefaultLocation);
  const onCheckDefaultMeasurementType = () => setCheckDefaultMeasurement(!checkDefaultMeasurement);

  // @ts-ignore
  const { persistedFormData, useHookFormPersist, system } = props;

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
    defaultValues: { ...persistedFormData },
  });

  const MEASUREMENT_TYPE = 'measurement_type';
  const DEPTH = 'estimated_water_usage';
  const DEPTH_UNIT = 'estimated_water_usage_unit';
  const NOTES = 'notes';
  register(NOTES, { required: false });
  const disabled = !isValid;
  const { historyCancel } = useHookFormPersist(getValues);

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
    { label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.OTHER'), value: 'OTHER', default_measuring_type: '' },
  ];

  useEffect(() => {
    setIsVolumeDefaultMeasurementType(() => defaultMeasurementType === 'VOLUME');
    setIsDepthDefaultMeasurementType(() => defaultMeasurementType === 'DEPTH');
  }, [defaultMeasurementType]);

  const onDismissWaterUseCalculatorModel = () => {
    setShowWaterUseCalculatorModal(false);
  };

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={handleGoBack}
        onCancel={historyCancel}
        value={71}
        title={t('ADD_TASK.ADD_A_TASK')}
        cancelModalTitle={t('ADD_TASK.CANCEL')}
      />
      <></>
      <Main
        style={{ marginBottom: '16px' }}
        tooltipContent={
          <>
            {t('ADD_TASK.IRRIGATION_VIEW.BRAND_TOOLTIP.FIRST_PHRASE')}{' '}
            <Underlined>{t('ADD_TASK.FIELD_WORK_VIEW.FIELD_WORK_TASK')}</Underlined>
            {t('ADD_TASK.IRRIGATION_VIEW.BRAND_TOOLTIP.LAST_PHRASE')}{' '}
          </>
        }
      >
        {t('ADD_TASK.IRRIGATION_VIEW.TELL_US_ABOUT_YOUR_IRRIGATION_TASK')}
      </Main>

      <Controller
        control={control}
        name={t('IRRIGATION_TASK_LOWER')}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('ADD_TASK.IRRIGATION_VIEW.TYPE_OF_IRRIGATION')}
            options={IrrigationTypeOptions}
            style={{ marginBottom: '10px' }}
            onChange={(e) => {
              onChange(e);
              setIrrigationType(e.value);
              setDefaultMeasurementType(e.default_measuring_type);
            }}
            value={
              !value
                ? value
                : value?.value
                ? value
                : { value, label: t(`ADD_TASK.IRRIGATION_VIEW.TYPE.${value}`) }
            }
          />
        )}
      />
      {irrigationType === 'OTHER' && (
        <Input
          style={{ marginTop: '15px' }}
          label={t('ADD_TASK.IRRIGATION_VIEW.WHAT_TYPE_OF_IRRIGATION')}
          hookFormRegister={register('IrrigationType', { required: true })}
        />
      )}
      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.SET_AS_DEFAULT_TYPE_FOR_THIS_LOCATION')}
        onClick={onCheckDefaultLocation}
        checked={checkDefaultLocation}
        sm
        style={{ marginTop: '10px', marginBottom: '25px' }}
      />
      <Label className={styles.label} style={{ marginBottom: '12px', marginTop: '10px' }}>
        {t('ADD_TASK.IRRIGATION_VIEW.HOW_DO_YOU_MEASURE_WATER_USE_FOR_THIS_IRRIGATION_TYPE')}
      </Label>

      <RadioGroup
        hookFormControl={control}
        name={MEASUREMENT_TYPE}
        radios={[
          {
            value: 'VOLUME',
            label: t('ADD_TASK.IRRIGATION_VIEW.VOLUME'),
            checked: isVolumeDefaultMeasurementType,
            onChange: () => {
              setIsDepthDefaultMeasurementType(() => !isDepthDefaultMeasurementType);
              setIsVolumeDefaultMeasurementType(() => !isVolumeDefaultMeasurementType);
            },
          },
          {
            value: 'DEPTH',
            label: t('ADD_TASK.IRRIGATION_VIEW.DEPTH'),
            checked: isDepthDefaultMeasurementType,
            onChange: () => {
              setIsDepthDefaultMeasurementType(() => !isDepthDefaultMeasurementType);
              setIsVolumeDefaultMeasurementType(() => !isVolumeDefaultMeasurementType);
            },
          },
        ]}
        required
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.SET_AS_DEFAULT_MEASUREMENT_FOR_THIS_IRRIGATION_TYPE')}
        onClick={onCheckDefaultMeasurementType}
        checked={checkDefaultMeasurement}
        sm
        style={{ marginTop: '2px', marginBottom: '20px' }}
      />

      <Unit
        register={register}
        defaultValue={totalWaterUsage}
        displayUnitName={DEPTH_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.ESTIMATED_WATER_USAGE')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={DEPTH}
        unitType={waterUsage}
        max={999999999}
        system={system}
        control={control}
        style={{ paddingBottom: '32px' }}
        disabled={false}
      />

      <Label>
        {t('ADD_TASK.IRRIGATION_VIEW.NOT_SURE')}{' '}
        <Underlined onClick={() => setShowWaterUseCalculatorModal(true)}>
          {t('ADD_TASK.IRRIGATION_VIEW.CALCULATE_WATER_USAGE')}
        </Underlined>
      </Label>

      <InputAutoSize
        label={t('LOG_COMMON.NOTES')}
        optional={true}
        hookFormRegister={register(NOTES, {
          maxLength: { value: 10000, message: t('ADD_TASK.TASK_NOTES_CHAR_LIMIT') },
        })}
        style={{ paddingTop: '20px' }}
        name={NOTES}
        errors={errors[NOTES]?.message}
      />

      {showWaterUseCalculatorModal && (
        <WaterUseCalculatorModal
          dismissModal={onDismissWaterUseCalculatorModel}
          // setTotalWaterUsage={setTotalWaterUsage}
        />
      )}
    </Form>
  );
};
export default PureIrrigationTask;
