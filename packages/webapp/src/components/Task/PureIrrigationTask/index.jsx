import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Label, Underlined } from '../../Typography';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import ReactSelect from '../../Form/ReactSelect';
import Checkbox from '../../Form/Checkbox';
import RadioGroup from '../../Form/RadioGroup';
import styles from '../../Typography/typography.module.scss';
import Input, { getInputErrors, numberOnKeyDown } from '../../Form/Input';
import Unit from '../../Form/Unit';
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';
import { waterUsage } from '../../../util/convert-units/unit';
import PropTypes from 'prop-types';
import WaterUsageCalculatorModal from '../../Modals/WaterUsageCalculatorModal';
import { getIrrigationTaskTypes } from '../../../containers/Task/IrrigationTaskTypes/saga';
import { useDispatch, useSelector } from 'react-redux';
import { irrigationTaskTypesSliceSelector } from '../../../containers/irrigationTaskTypesSlice';
import { cropLocationsSelector } from '../../../containers/locationSlice';

export default function PureIrrigationTask({
  system,
  register,
  control,
  setValue,
  getValues,
  reset,
  watch,
  formState,
  getFieldState = {},
  disabled = false,
  isModified = false,
  locations,
  otherTaskType = false,
  createTask = false,
}) {
  const { t } = useTranslation();
  const { errors } = formState;
  const [showWaterUseCalculatorModal, setShowWaterUseCalculatorModal] = useState(false);
  const { irrigationTaskTypes = [] } = useSelector(irrigationTaskTypesSliceSelector);
  const cropLocations = useSelector(cropLocationsSelector);
  const location =
    locations?.length &&
    cropLocations.filter(
      (cropLocation) => cropLocation.location_id === locations[0].location_id,
    )[0];
  const location_defaults = location?.location_defaults;
  const locationDefaults = [location_defaults]?.map((location) => {
    return {
      ...location,
      ...irrigationTaskTypes?.filter(
        (option) => option.irrigation_type_id === location?.irrigation_type_id,
      )[0],
    };
  })[0];
  const [irrigationTypeValue, setIrrigationTypeValue] = useState(() => {
    if (locationDefaults?.irrigation_task_type) return locationDefaults?.irrigation_task_type;
  });
  const [totalVolumeWaterUsage, setTotalVolumeWaterUsage] = useState();
  const [totalDepthWaterUsage, setTotalDepthWaterUsage] = useState();
  const [estimatedWaterUsageComputed, setEstimatedWaterUsageComputed] = useState(false);

  const dispatch = useDispatch();

  const getDefaultIrrigationTypes = () => {
    const defaultIrrigationTaskTypes = [];
    for (let type of irrigationTaskTypes) {
      if (type.farm_id === null) {
        defaultIrrigationTaskTypes.push(type.irrigation_type_name);
      }
    }
    return defaultIrrigationTaskTypes;
  };

  const IrrigationTypeOptions = useMemo(() => {
    let options;
    const defaultIrrigationTaskTypes = getDefaultIrrigationTypes();
    options = irrigationTaskTypes.map((irrigationType) => {
      return {
        value: irrigationType.irrigation_type_name,
        label: defaultIrrigationTaskTypes.includes(irrigationType.irrigation_type_name)
          ? t(`ADD_TASK.IRRIGATION_VIEW.TYPE.${irrigationType.irrigation_type_name}`)
          : irrigationType.irrigation_type_name,
        default_measuring_type: irrigationType.default_measuring_type,
        irrigation_type_id: irrigationType.irrigation_type_id,
      };
    });
    options.push({
      label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.OTHER'),
      value: 'OTHER',
      default_measuring_type: 'VOLUME',
      irrigation_type_id: null,
    });
    return options;
  }, [irrigationTaskTypes]);

  useEffect(() => {
    dispatch(getIrrigationTaskTypes());
  }, []);

  const stateController = () => {
    return { register, getValues, watch, control, setValue, reset };
  };
  const IRRIGATION_TYPE = 'irrigation_task.irrigation_type_name';
  const IRRIGATION_TYPE_ID = 'irrigation_task.irrigation_type_id';
  const DEFAULT_IRRIGATION_TASK_LOCATION = 'irrigation_task.default_irrigation_task_type_location';
  const DEFAULT_IRRIGATION_MEASUREMENT = 'irrigation_task.default_irrigation_task_type_measurement';
  const IRRIGATION_TYPE_OTHER = 'irrigation_task.irrigation_task_type_other';
  const MEASUREMENT_TYPE = 'irrigation_task.measuring_type';
  const ESTIMATED_WATER_USAGE = 'irrigation_task.estimated_water_usage';
  const ESTIMATED_WATER_USAGE_UNIT = 'irrigation_task.estimated_water_usage_unit';

  const estimated_water_usage = watch(ESTIMATED_WATER_USAGE);
  const estimated_water_usage_unit = watch(ESTIMATED_WATER_USAGE_UNIT);
  const irrigation_type = watch(IRRIGATION_TYPE);
  const measurement_type = watch(MEASUREMENT_TYPE);

  // If the task is being modified on completion then set the "set default" flags to false in the form
  // this is to avoid overwriting default setting set by another task during that task's creation
  // the "set default" checkbox is only a visual reference for users to see this irrigation type was set as default during its creation
  useEffect(() => {
    if (isModified) {
      setValue(DEFAULT_IRRIGATION_TASK_LOCATION, false);
      setValue(DEFAULT_IRRIGATION_MEASUREMENT, false);
    }
  }, [isModified]);

  const onDismissWaterUseCalculatorModel = () => setShowWaterUseCalculatorModal(false);
  const handleModalSubmit = () => {
    const isDepthCalculatorValid =
      !getFieldState('irrigation_task.application_depth').invalid &&
      !getFieldState('irrigation_task.default_location_application_depth').invalid;
    const isVolumeCalculateValid =
      !getFieldState('irrigation_task.estimated_flow_rate').invalid &&
      !getFieldState('irrigation_task.estimated_duration').invalid;
    const isModalValid =
      measurement_type === 'DEPTH' ? isDepthCalculatorValid : isVolumeCalculateValid;
    if (isModalValid) {
      setValue(
        ESTIMATED_WATER_USAGE,
        measurement_type === 'VOLUME' ? totalVolumeWaterUsage : totalDepthWaterUsage,
        { shouldValidate: true, shouldDirty: true },
      );
      setValue(
        ESTIMATED_WATER_USAGE_UNIT,
        ['ml', 'l'].includes(estimated_water_usage_unit.value)
          ? getUnitOptionMap()['l']
          : getUnitOptionMap()['gal'],
      );
      onDismissWaterUseCalculatorModel();
    }
  };

  useEffect(() => {
    if (!createTask) return;
    if (locationDefaults?.irrigation_type_id) {
      setValue(
        IRRIGATION_TYPE,
        IrrigationTypeOptions.find(
          (options) => options.irrigation_type_id === locationDefaults?.irrigation_type_id,
        ),
      );
      setValue(IRRIGATION_TYPE_ID, locationDefaults.irrigation_type_id);
    }
    if (locationDefaults?.default_measuring_type) {
      setValue(MEASUREMENT_TYPE, locationDefaults?.default_measuring_type);
    }
  }, []);

  const getDefaultIrrigationTypeOptions = () => {
    if (locationDefaults?.irrigation_type_id) {
      return IrrigationTypeOptions.find(
        (options) => options.irrigation_type_id === locationDefaults?.irrigation_type_id,
      );
    } else {
      return IrrigationTypeOptions.find(
        (options) => options.irrigation_type_id === irrigation_type?.irrigation_type_id,
      );
    }
  };
  useEffect(() => {
    if (
      estimated_water_usage !== totalDepthWaterUsage &&
      otherTaskType &&
      !estimatedWaterUsageComputed
    ) {
      reset({
        ...getValues(),
        irrigation_task: {
          ...getValues().irrigation_task,
        },
      });
      setTotalDepthWaterUsage('');
    }
  }, [showWaterUseCalculatorModal]);

  const waterCalculatorDisabled =
    !showWaterUseCalculatorModal ||
    !measurement_type ||
    (measurement_type === 'DEPTH' && !location);

  return (
    <>
      <Controller
        control={control}
        name={IRRIGATION_TYPE}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, onFocus } }) => {
          return (
            <ReactSelect
              onFocus={onFocus}
              label={t('ADD_TASK.IRRIGATION_VIEW.TYPE_OF_IRRIGATION')}
              options={IrrigationTypeOptions}
              onBlur={onBlur}
              onChange={(e) => {
                onChange(e);
                setIrrigationTypeValue(e.value);
                setValue(MEASUREMENT_TYPE, e.default_measuring_type);
                setValue(IRRIGATION_TYPE_ID, e.irrigation_type_id);
              }}
              isDisabled={disabled}
              value={IrrigationTypeOptions.find((options) => options.value === irrigation_type)}
              defaultValue={getDefaultIrrigationTypeOptions}
            />
          );
        }}
      />
      {(irrigationTypeValue === 'OTHER' ||
        irrigation_type?.label === t('ADD_TASK.IRRIGATION_VIEW.TYPE.OTHER')) && (
        <Input
          style={{ marginTop: '6px' }}
          disabled={disabled}
          label={t('ADD_TASK.IRRIGATION_VIEW.WHAT_TYPE_OF_IRRIGATION')}
          hookFormRegister={register(IRRIGATION_TYPE_OTHER, {
            required: true,
            maxLength: {
              value: 100,
              message: t('ADD_TASK.IRRIGATION_VIEW.IRRIGATION_TYPE_CHAR_LIMIT'),
            },
          })}
          errors={getInputErrors(errors, IRRIGATION_TYPE_OTHER)}
        />
      )}
      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.SET_AS_DEFAULT_TYPE_FOR_THIS_LOCATION')}
        sm
        // style={{ marginTop: '6px', marginBottom: '40px' }}
        style={{ display: 'none' }} // temporarily hiding for April 2023 release
        hookFormRegister={register(DEFAULT_IRRIGATION_TASK_LOCATION)}
        disabled={disabled || isModified}
      />
      <div style={{ paddingBlock: '10px' }} />

      <Label className={styles.label} style={{ marginBottom: '24px', fontSize: '16px' }}>
        {t('ADD_TASK.IRRIGATION_VIEW.HOW_DO_YOU_MEASURE_WATER_USE_FOR_THIS_IRRIGATION_TYPE')}
      </Label>

      <RadioGroup
        required
        name={MEASUREMENT_TYPE}
        hookFormControl={control}
        disabled={disabled}
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
        hookFormRegister={register(DEFAULT_IRRIGATION_MEASUREMENT)}
        disabled={disabled || isModified}
        style={{ display: 'none' }} // temporarily hiding for April 2023 release
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
        style={{ marginTop: '40px', marginBottom: `${disabled ? 40 : 0}px` }}
        disabled={disabled}
        onKeyDown={numberOnKeyDown}
        onChangeUnitOption={() => setEstimatedWaterUsageComputed(true)}
      />
      {!disabled && (
        <>
          <Label style={{ marginTop: '4px', marginBottom: `${disabled ? 36 : 0}px` }}>
            {t('ADD_TASK.IRRIGATION_VIEW.NOT_SURE')}{' '}
            <Underlined onClick={() => !disabled && setShowWaterUseCalculatorModal(true)}>
              {t('ADD_TASK.IRRIGATION_VIEW.CALCULATE_WATER_USAGE')}
            </Underlined>
          </Label>
        </>
      )}

      {!waterCalculatorDisabled && (
        <WaterUsageCalculatorModal
          dismissModal={onDismissWaterUseCalculatorModel}
          measurementType={measurement_type}
          system={system}
          handleModalSubmit={handleModalSubmit}
          totalVolumeWaterUsage={totalVolumeWaterUsage}
          setTotalVolumeWaterUsage={setTotalVolumeWaterUsage}
          totalDepthWaterUsage={totalDepthWaterUsage}
          setTotalDepthWaterUsage={setTotalDepthWaterUsage}
          formState={stateController}
          locationDefaults={locationDefaults}
          location={location}
          errors={errors}
        />
      )}
    </>
  );
}

PureIrrigationTask.propTypes = {
  system: PropTypes.oneOf(['imperial', 'metric']).isRequired,
  disabled: PropTypes.bool,
  locations: PropTypes.array,
  isModified: PropTypes.bool,
};
