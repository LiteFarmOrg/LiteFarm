import React, { useEffect, useState } from 'react';
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
  percentage_location,
  roundToTwoDecimal,
  water_valve_flow_rate,
} from '../../../util/convert-units/unit';
import Checkbox from '../../Form/Checkbox';
import { Label } from '../../Typography';
import { useSelector } from 'react-redux';
import { cropLocationsSelector } from '../../../containers/locationSlice';
import { convert } from '../../../util/convert-units/convert';
import modalStyles from './styles.module.scss';
import { numberOnKeyDown } from '../../Form/Input';

const TotalWaterUsage = ({ totalWaterUsage, estimated_water_usage_unit }) => {
  const { t } = useTranslation();
  return (
    <div className={modalStyles.labelContainer}>
      <Label className={modalStyles.label}>{t('ADD_TASK.IRRIGATION_VIEW.TOTAL_WATER_USAGE')}</Label>
      <Label className={modalStyles.label}>
        {totalWaterUsage} {['ml', 'l'].includes(estimated_water_usage_unit?.value) ? 'l' : 'gal'}
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
  const estimated_duration_unit = watch(ESTIMATED_DURATION_UNIT);
  const estimated_water_usage_unit = getValues('irrigation_task.estimated_water_usage_unit');

  useEffect(() => {
    if (estimated_duration && estimated_flow_rate) {
      setTotalWaterUsage(() => {
        if (
          ['l/h', 'gal/h'].includes(estimated_flow_rate_unit?.value) &&
          estimated_duration_unit?.label === 'h'
        )
          return roundToTwoDecimal(estimated_flow_rate * estimated_duration);
        if (
          ['l/min', 'gal/min'].includes(estimated_flow_rate_unit?.value) &&
          estimated_duration_unit?.label === 'm'
        )
          return roundToTwoDecimal(estimated_flow_rate * estimated_duration);
        if (
          ['l/h', 'gal/h'].includes(estimated_flow_rate_unit?.value) &&
          estimated_duration_unit?.label === 'm'
        )
          return roundToTwoDecimal(estimated_flow_rate * (estimated_duration / 60));
        if (
          ['l/min', 'gal/min'].includes(estimated_flow_rate_unit?.value) &&
          estimated_duration_unit?.label === 'h'
        )
          return roundToTwoDecimal(estimated_flow_rate * (estimated_duration * 60));
        return totalWaterUsage;
      });
    } else {
      setTotalWaterUsage('');
    }
  }, [estimated_duration, estimated_flow_rate]);

  useEffect(() => {
    if (!watch(FLOW_RATE) && !!locationDefaults?.estimated_flow_rate) {
      if (locationDefaults?.estimated_flow_rate) {
        setValue(FLOW_RATE, locationDefaults?.estimated_flow_rate);
        setValue(FLOW_RATE_UNIT, getUnitOptionMap()[locationDefaults?.estimated_flow_rate_unit]);
      }
    }
  }, [locationDefaults]);

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
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.DEFAULT_LOCATION_FLOW_RATE')}
        sm
        style={{ marginTop: '10px', marginBottom: '30px' }}
        hookFormRegister={register(DEFAULT_LOCATION_FLOW_RATE)}
      />

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
      />

      <TotalWaterUsage
        totalWaterUsage={totalWaterUsage}
        estimated_water_usage_unit={estimated_water_usage_unit}
      />
    </>
  );
};

const WaterUseDepthCalculator = ({
  system,
  setTotalWaterUsage,
  totalWaterUsage,
  formState,
  locationDefaults,
}) => {
  const { t } = useTranslation();
  const { register, getValues, watch, control, setValue } = formState();
  const [locationSize, setLocationSize] = useState();

  const location = useSelector(cropLocationsSelector).filter(
    (location) => location?.location_id === getValues().locations[0]?.location_id,
  )[0];

  const APPLICATION_DEPTH = 'irrigation_task.application_depth';
  const APPLICATION_DEPTH_UNIT = 'irrigation_task.application_depth_unit';
  const DEFAULT_LOCATION_APPLICATION_DEPTH = 'irrigation_task.default_location_application_depth';
  const PERCENTAGE_LOCATION_IRRIGATED = 'irrigation_task.percent_of_location_irrigated';
  const PERCENTAGE_LOCATION_IRRIGATED_UNIT = 'irrigation_task.percent_of_location_irrigated_unit';
  const LOCATION_SIZE = 'irrigation_task.location_size';
  const LOCATION_SIZE_UNIT = 'irrigation_task.location_size_unit';
  const IRRIGATED_AREA = 'irrigation_task.irrigated_area';
  const IRRIGATED_AREA_UNIT = 'irrigation_task.irrigated_area_unit';
  const estimated_water_usage_unit = getValues('irrigation_task.estimated_water_usage_unit');

  const irrigated_area = watch(IRRIGATED_AREA);
  const application_depth = watch(APPLICATION_DEPTH);
  const percentage_location_irrigated = watch(PERCENTAGE_LOCATION_IRRIGATED);
  const application_depth_unit = watch(APPLICATION_DEPTH_UNIT);

  useEffect(() => {
    if (['gal', 'fl-oz'].includes(getValues('irrigation_task').estimated_water_usage_unit?.value)) {
      const conversion_unit = location.total_area_unit === 'ha' ? 'ft2' : 'ac';
      setValue(LOCATION_SIZE_UNIT, getUnitOptionMap()[conversion_unit]);
      setValue(IRRIGATED_AREA_UNIT, getUnitOptionMap()[conversion_unit]);
    } else {
      setValue(LOCATION_SIZE_UNIT, getUnitOptionMap()[location.total_area_unit]);
      setValue(IRRIGATED_AREA_UNIT, getUnitOptionMap()[location.total_area_unit]);
    }
    setLocationSize(location.total_area);
  }, [location]);

  useEffect(() => {
    if (percentage_location_irrigated) {
      const irrigatedArea = roundToTwoDecimal(locationSize * (percentage_location_irrigated / 100));
      setValue(IRRIGATED_AREA, irrigatedArea);
    } else {
      setValue(IRRIGATED_AREA, '');
    }
  }, [locationSize, percentage_location_irrigated]);

  useEffect(() => {
    if (irrigated_area && application_depth) {
      setTotalWaterUsage(() => {
        if (application_depth_unit.value === 'in') {
          const Irrigated_area_in_ft2 =
            getValues(IRRIGATED_AREA_UNIT)?.value === 'ft2'
              ? roundToTwoDecimal(irrigated_area)
              : roundToTwoDecimal(convert(irrigated_area).from('ac').to('ft2')); // convert from ac to ft2
          const volume_in_ft3 =
            Irrigated_area_in_ft2 *
            (application_depth ? convert(application_depth).from('in').to('ft') : 1); // convert depth from inc to ft
          return roundToTwoDecimal(convert(volume_in_ft3).from('ft3').to('gal')); // convert ft3 to gallons
        }
        const Irrigated_area_in_m_squared =
          getValues(IRRIGATED_AREA_UNIT)?.value === 'm2'
            ? roundToTwoDecimal(irrigated_area)
            : roundToTwoDecimal(convert(irrigated_area).from('ha').to('m2')); // to convert from ha to m2
        const Volume_in_m_cubed =
          Irrigated_area_in_m_squared *
          (application_depth ? convert(application_depth).from('mm').to('m') : 1); // to convert application depth from mm to m
        return roundToTwoDecimal(convert(Volume_in_m_cubed).from('m3').to('l')); // to convert from m3 to litres
      });
    } else {
      setTotalWaterUsage('');
    }
  }, [application_depth, percentage_location_irrigated, irrigated_area]);

  useEffect(() => {
    if (
      !watch(APPLICATION_DEPTH) &&
      locationDefaults?.application_depth &&
      locationDefaults?.application_depth_unit
    ) {
      setValue(APPLICATION_DEPTH, locationDefaults?.application_depth);
      setValue(
        APPLICATION_DEPTH_UNIT,
        getUnitOptionMap()[locationDefaults?.application_depth_unit],
      );
    }
  }, [locationDefaults]);

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
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.DEFAULT_APPLICATION_DEPTH')}
        sm
        style={{ marginTop: '10px', marginBottom: '30px' }}
        hookFormRegister={register(DEFAULT_LOCATION_APPLICATION_DEPTH)}
      />
      <Unit
        register={register}
        displayUnitName={PERCENTAGE_LOCATION_IRRIGATED_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.PERCENTAGE_LOCATION_TO_BE_IRRIGATED')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={PERCENTAGE_LOCATION_IRRIGATED}
        unitType={percentage_location}
        max={100}
        system={system}
        control={control}
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
          value={locationSize}
          disabled
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
        />
      </div>
      <TotalWaterUsage
        totalWaterUsage={totalWaterUsage}
        estimated_water_usage_unit={estimated_water_usage_unit}
      />
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
      />
    </ModalComponent>
  );
}

WaterUsageCalculatorModal.propTypes = {
  dismissModal: PropTypes.func,
  measurementType: PropTypes.string,
  locationDefaults: PropTypes.object,
};
