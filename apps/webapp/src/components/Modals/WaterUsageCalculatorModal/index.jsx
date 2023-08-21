import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import { ReactComponent as Calculator } from '../../../assets/images/task/Calculator.svg';
import styles from '../QuickAssignModal/styles.module.scss';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import Unit from '../../Form/Unit';
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';
import {
  irrigation_task_estimated_duration,
  irrigation_depth,
  location_area,
  roundToTwoDecimal,
  water_valve_flow_rate,
  getDefaultUnit,
} from '../../../util/convert-units/unit';
import Checkbox from '../../Form/Checkbox';
import { Label } from '../../Typography';
import { convert } from '../../../util/convert-units/convert';
import modalStyles from './styles.module.scss';
import Input, { getInputErrors, numberOnKeyDown } from '../../Form/Input';

const totalWaterUsageUnit = {
  metric: 'l',
  imperial: 'gal',
};

const TotalWaterUsage = ({ totalWaterUsage, system }) => {
  const { t } = useTranslation();
  const value =
    totalWaterUsage &&
    roundToTwoDecimal(convert(totalWaterUsage).from('l').to(totalWaterUsageUnit[system]));

  return (
    <div className={modalStyles.labelContainer}>
      <Label className={modalStyles.label}>{t('ADD_TASK.IRRIGATION_VIEW.TOTAL_WATER_USAGE')}</Label>
      <Label className={modalStyles.label}>
        {value} {totalWaterUsageUnit[system]}
      </Label>
    </div>
  );
};

const WaterUseVolumeCalculator = ({
  system,
  setTotalWaterUsage,
  totalWaterUsage,
  formState,
  locationDefaults,
}) => {
  const { t } = useTranslation();
  const { register, getValues, watch, control, setValue } = formState();

  const FLOW_RATE = 'irrigation_task.estimated_flow_rate';
  const FLOW_RATE_UNIT = 'irrigation_task.estimated_flow_rate_unit';
  const DEFAULT_LOCATION_FLOW_RATE = 'irrigation_task.default_location_flow_rate';
  const ESTIMATED_DURATION = 'irrigation_task.estimated_duration';
  const ESTIMATED_DURATION_UNIT = 'irrigation_task.estimated_duration_unit';

  const estimated_flow_rate = watch(FLOW_RATE);
  const estimated_flow_rate_unit = watch(FLOW_RATE_UNIT);
  const estimated_duration = watch(ESTIMATED_DURATION);

  const flowRateDefaultValues = useMemo(() => {
    if (getValues(FLOW_RATE)) {
      return { defaultValue: getValues(FLOW_RATE), to: getValues(FLOW_RATE_UNIT).value };
    }
    if (locationDefaults?.estimated_flow_rate) {
      return {
        defaultValue: locationDefaults.estimated_flow_rate,
        to: locationDefaults.estimated_flow_rate_unit,
      };
    }
    return {};
  }, []);

  useEffect(() => {
    if (estimated_duration && estimated_flow_rate && estimated_flow_rate_unit) {
      // flow rate database unit: l/min, duration database unit: min
      setTotalWaterUsage(estimated_flow_rate * estimated_duration);
    } else {
      setTotalWaterUsage('');
    }
  }, [estimated_duration, estimated_flow_rate]);

  return (
    <>
      <Unit
        register={register}
        displayUnitName={FLOW_RATE_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.ESTIMATED_FLOW_RATE')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={FLOW_RATE}
        unitType={water_valve_flow_rate}
        max={999999.99}
        system={system}
        control={control}
        {...flowRateDefaultValues}
        data-testid="volumecalculator-flowrate"
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.DEFAULT_LOCATION_FLOW_RATE')}
        sm
        // style={{ marginTop: '10px', marginBottom: '30px' }}
        style={{ display: 'none' }} // temporarily hiding for April 2023 release
        hookFormRegister={register(DEFAULT_LOCATION_FLOW_RATE)}
      />
      <div style={{ paddingBlock: '10px' }} />

      <Unit
        register={register}
        displayUnitName={ESTIMATED_DURATION_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.ESTIMATED_DURATION')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={ESTIMATED_DURATION}
        unitType={irrigation_task_estimated_duration}
        max={999999.99}
        system={system}
        control={control}
        onKeyDown={numberOnKeyDown}
        style={{ paddingBottom: '32px' }}
        data-testid="volumecalculator-duration"
      />

      <TotalWaterUsage totalWaterUsage={totalWaterUsage} system={system} />
    </>
  );
};

const WaterUseDepthCalculator = ({
  system,
  setTotalWaterUsage,
  totalWaterUsage,
  formState,
  locationDefaults,
  location,
  errors,
}) => {
  const { t } = useTranslation();
  const { register, getValues, watch, control, setValue } = formState();

  const APPLICATION_DEPTH = 'irrigation_task.application_depth';
  const APPLICATION_DEPTH_UNIT = 'irrigation_task.application_depth_unit';
  const DEFAULT_LOCATION_APPLICATION_DEPTH = 'irrigation_task.default_location_application_depth';
  const PERCENTAGE_LOCATION_IRRIGATED = 'irrigation_task.percent_of_location_irrigated';
  const LOCATION_SIZE = 'irrigation_task.location_size';
  const LOCATION_SIZE_UNIT = 'irrigation_task.location_size_unit';
  const IRRIGATED_AREA = 'irrigation_task.irrigated_area';
  const IRRIGATED_AREA_UNIT = 'irrigation_task.irrigated_area_unit';

  const irrigated_area = watch(IRRIGATED_AREA);
  const application_depth = watch(APPLICATION_DEPTH);
  const percentage_location_irrigated = watch(PERCENTAGE_LOCATION_IRRIGATED);

  useEffect(() => {
    if (location.total_area !== getValues(LOCATION_SIZE)) {
      setValue(LOCATION_SIZE, location.total_area);
      setValue(
        LOCATION_SIZE_UNIT,
        getUnitOptionMap()[getDefaultUnit(location_area, location.total_area, system).displayUnit],
      );
    }
  }, []);

  useEffect(() => {
    let irrigatedArea = null;
    if (percentage_location_irrigated) {
      irrigatedArea = roundToTwoDecimal(
        location.total_area * (percentage_location_irrigated / 100),
      );
    }
    setValue(IRRIGATED_AREA, irrigatedArea);
    setValue(
      IRRIGATED_AREA_UNIT,
      getUnitOptionMap()[getDefaultUnit(location_area, irrigatedArea, system).displayUnit],
      { shouldValidate: true },
    );
  }, [location, percentage_location_irrigated]);

  useEffect(() => {
    if (irrigated_area && application_depth) {
      setTotalWaterUsage(
        convert(irrigated_area * application_depth)
          .from('m3')
          .to('l'),
      );
    } else {
      setTotalWaterUsage('');
    }
  }, [application_depth, irrigated_area]);

  return (
    <>
      <Unit
        register={register}
        displayUnitName={APPLICATION_DEPTH_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.ESTIMATED_APPLICATION_DEPTH')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={APPLICATION_DEPTH}
        unitType={irrigation_depth}
        max={999.9}
        system={system}
        control={control}
        defaultValue={locationDefaults?.application_depth || null}
        to={locationDefaults?.application_depth_unit || ''}
        data-testid="depthcalculator-depth"
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.DEFAULT_APPLICATION_DEPTH')}
        sm
        // style={{ marginTop: '10px', marginBottom: '30px' }}
        style={{ display: 'none' }} // temporarily hiding for April 2023 release
        hookFormRegister={register(DEFAULT_LOCATION_APPLICATION_DEPTH)}
      />
      <div style={{ paddingBlock: '10px' }} />

      <Input
        label={t('ADD_TASK.IRRIGATION_VIEW.PERCENTAGE_LOCATION_TO_BE_IRRIGATED')}
        type="number"
        unit="%"
        min={0}
        max={100}
        onKeyPress={numberOnKeyDown}
        hookFormRegister={register(PERCENTAGE_LOCATION_IRRIGATED, {
          min: { value: 0, message: t('UNIT.VALID_VALUE') + 100 },
          max: { value: 100, message: t('UNIT.VALID_VALUE') + 100 },
          valueAsNumber: true,
        })}
        errors={getInputErrors(errors, PERCENTAGE_LOCATION_IRRIGATED)}
        optional
      />

      <div
        style={{
          flexDirection: 'row',
          display: 'inline-flex',
          paddingBottom: '40px',
          width: '100%',
          gap: '16px',
          marginTop: '20px',
        }}
      >
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('ADD_TASK.IRRIGATION_VIEW.LOCATION_SIZE')}
          name={LOCATION_SIZE}
          displayUnitName={LOCATION_SIZE_UNIT}
          unitType={location_area}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          disabled
          data-testid="depthcalculator-locationsize"
        />

        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('ADD_TASK.IRRIGATION_VIEW.IRRIGATED_AREA')}
          name={IRRIGATED_AREA}
          displayUnitName={IRRIGATED_AREA_UNIT}
          unitType={location_area}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          disabled={true}
          data-testid="depthcalculator-irrigatedarea"
        />
      </div>
      <TotalWaterUsage totalWaterUsage={totalWaterUsage} system={system} />
    </>
  );
};

const WaterUseModal = ({
  measurementType,
  system,
  totalVolumeWaterUsage,
  setTotalVolumeWaterUsage,
  totalDepthWaterUsage,
  setTotalDepthWaterUsage,
  formState,
  locationDefaults,
  location,
  errors,
}) => {
  if (measurementType === 'VOLUME')
    return (
      <WaterUseVolumeCalculator
        system={system}
        totalWaterUsage={totalVolumeWaterUsage}
        setTotalWaterUsage={setTotalVolumeWaterUsage}
        formState={formState}
        locationDefaults={locationDefaults}
      />
    );
  if (measurementType === 'DEPTH')
    return (
      <WaterUseDepthCalculator
        system={system}
        totalWaterUsage={totalDepthWaterUsage}
        setTotalWaterUsage={setTotalDepthWaterUsage}
        formState={formState}
        locationDefaults={locationDefaults}
        location={location}
        errors={errors}
      />
    );
};

export default function WaterUsageCalculatorModal({
  dismissModal,
  measurementType,
  system,
  handleModalSubmit,
  totalVolumeWaterUsage,
  setTotalVolumeWaterUsage,
  totalDepthWaterUsage,
  setTotalDepthWaterUsage,
  formState,
  locationDefaults,
  location,
  errors,
}) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} className={styles.button} color="secondary" sm>
            {t('common:CANCEL')}
          </Button>

          <Button className={styles.button} onClick={handleModalSubmit} color="primary" sm>
            {t('common:SAVE')}
          </Button>
        </>
      }
      icon={<Calculator />}
      tooltipContent={`${t('ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR_INFO.PHRASE1')}  ${t(
        `ADD_TASK.IRRIGATION_VIEW.${measurementType}`,
      ).toLowerCase()}. ${t('ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR_INFO.PHRASE2')} ${
        measurementType === 'DEPTH'
          ? `${t('ADD_TASK.IRRIGATION_VIEW.VOLUME').toLowerCase()}`
          : `${t('ADD_TASK.IRRIGATION_VIEW.DEPTH').toLowerCase()}`
      } ${t('ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR_INFO.PHRASE3')} ${
        measurementType === 'DEPTH'
          ? `${t('ADD_TASK.IRRIGATION_VIEW.VOLUME').toLowerCase()}`
          : `${t('ADD_TASK.IRRIGATION_VIEW.DEPTH').toLowerCase()}`
      }.`}
    >
      <WaterUseModal
        system={system}
        measurementType={measurementType}
        totalVolumeWaterUsage={totalVolumeWaterUsage}
        setTotalVolumeWaterUsage={setTotalVolumeWaterUsage}
        totalDepthWaterUsage={totalDepthWaterUsage}
        setTotalDepthWaterUsage={setTotalDepthWaterUsage}
        formState={formState}
        locationDefaults={locationDefaults}
        location={location}
        errors={errors}
      />
    </ModalComponent>
  );
}

WaterUsageCalculatorModal.propTypes = {
  dismissModal: PropTypes.func,
  measurementType: PropTypes.string,
  locationDefaults: PropTypes.object,
};
