import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import { ReactComponent as Calculator } from '../../../assets/images/task/Calculator.svg';
import styles from '../QuickAssignModal/styles.module.scss';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import Unit from '../../Form/Unit';
import {
  estimated_duration,
  irrigation_depth,
  location_area,
  percentage_location,
  water_valve_flow_rate,
} from '../../../util/convert-units/unit';
import Checkbox from '../../Form/Checkbox';
import { Label } from '../../Typography';
import { useSelector } from 'react-redux';
import { cropLocationsSelector } from '../../../containers/locationSlice';
import { useForm } from 'react-hook-form';
import { convert } from '../../../util/convert-units/convert';
import modalStyles from './styles.module.scss';

const TotalWaterUsage = ({ totalWaterUsage }) => {
  const { t } = useTranslation();
  return (
    <div className={modalStyles.labelContainer}>
      <Label className={modalStyles.label}>{t('ADD_TASK.IRRIGATION_VIEW.TOTAL_WATER_USAGE')}</Label>
      <Label className={modalStyles.label}>{totalWaterUsage} l</Label>
    </div>
  );
};

const WaterUseVolumeCalculator = ({ system, setTotalWaterUsage, totalWaterUsage, formState }) => {
  const { t } = useTranslation();
  const { register, getValues, watch, control, setValue } = formState();
  const {
    estimated_flow_rate,
    estimated_flow_rate_unit,
    estimated_irrigation_duration,
    estimated_irrigation_duration_unit,
  } = getValues();

  useEffect(() => {
    if (estimated_flow_rate && estimated_irrigation_duration) {
      setTotalWaterUsage(() => {
        if (
          estimated_flow_rate_unit.label === 'l/h' &&
          estimated_irrigation_duration_unit.label === 'h'
        )
          return estimated_flow_rate * estimated_irrigation_duration;
        if (
          estimated_flow_rate_unit.label === 'l/m' &&
          estimated_irrigation_duration_unit.label === 'min'
        )
          return estimated_flow_rate * estimated_irrigation_duration;
        if (
          estimated_flow_rate_unit.label === 'l/h' &&
          estimated_irrigation_duration_unit.label === 'min'
        )
          return (estimated_flow_rate * estimated_irrigation_duration) / 60;
        if (
          estimated_flow_rate_unit.label === 'l/m' &&
          estimated_irrigation_duration_unit.label === 'h'
        )
          return estimated_flow_rate * estimated_irrigation_duration * 60;
        return totalWaterUsage;
      });
    }
  }, [estimated_irrigation_duration, estimated_flow_rate]);

  const FLOW_RATE = 'estimated_flow_rate';
  const FLOW_RATE_UNIT = 'estimated_flow_rate_unit';
  const DEFAULT_LOCATION_FLOW_RATE = 'default_location_flow_rate';
  const ESTIMATED_DURATION = 'estimated_irrigation_duration';
  const ESTIMATED_DURATION_UNIT = 'estimated_irrigation_duration_unit';

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
        onChangeUnitOption={(e) => {
          if (e.value === 'l/h' && estimated_flow_rate_unit.value === 'l/min')
            setValue(FLOW_RATE, convert(getValues(FLOW_RATE)).from('l/h').to('l/min'));
          if (e.value === 'l/min' && estimated_flow_rate_unit.value === 'l/h')
            setValue(FLOW_RATE, convert(getValues(FLOW_RATE)).from('l/min').to('l/h'));
        }}
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
        unitType={estimated_duration}
        max={999999.99}
        system={system}
        control={control}
        style={{ paddingBottom: '32px' }}
        onChangeUnitOption={(e) => {
          if (e.label === 'h' && estimated_irrigation_duration_unit.label === 'min')
            setValue(
              ESTIMATED_DURATION,
              convert(getValues(ESTIMATED_DURATION)).from('min').to('h'),
            );
          if (e.label === 'min' && estimated_irrigation_duration_unit.label === 'h')
            setValue(
              ESTIMATED_DURATION,
              convert(getValues(ESTIMATED_DURATION)).from('h').to('min'),
            );
        }}
      />

      <TotalWaterUsage totalWaterUsage={totalWaterUsage} />
    </>
  );
};

const WaterUseDepthCalculator = ({ system, setTotalWaterUsage, totalWaterUsage, formState }) => {
  const { t } = useTranslation();
  const { register, getValues, watch, control, setValue } = formState();
  const { irrigated_area, application_depth } = getValues();
  const modalState = useForm({ mode: 'onChange', shouldUnregister: false });
  const { percentage_location_irrigated } = modalState.getValues();

  const locationSize = useSelector(cropLocationsSelector).filter(
    (location) => location?.location_id === getValues().locations[0]?.location_id,
  )[0]?.total_area;

  const APPLICATION_DEPTH = 'application_depth';
  const APPLICATION_DEPTH_UNIT = 'application_depth_unit';
  const DEFAULT_LOCATION_APPLICATION_DEPTH = 'default_location_application_depth';
  const PERCENTAGE_LOCATION_IRRIGATED = 'percentage_location_irrigated';
  const PERCENTAGE_LOCATION_IRRIGATED_UNIT = 'percentage_location_irrigated_unit';
  const LOCATION_SIZE = 'location_size';
  const LOCATION_SIZE_UNIT = 'location_size_unit';
  const IRRIGATED_AREA = 'irrigated_area';
  const IRRIGATED_AREA_UNIT = 'irrigated_area_unit';

  useEffect(() => {
    if (locationSize && percentage_location_irrigated) {
      const irrigatedArea =
        locationSize * (percentage_location_irrigated ? percentage_location_irrigated / 100 : 1);
      setValue(IRRIGATED_AREA, irrigatedArea);
    }
  }, [locationSize, percentage_location_irrigated]);

  useEffect(() => {
    if (irrigated_area) {
      setTotalWaterUsage(() => {
        const Irrigated_area_in_m_squared = irrigated_area * 10000;
        const Volume_in_m_cubed = Irrigated_area_in_m_squared * (application_depth / 1000);
        return Volume_in_m_cubed * 1000;
      });
    }
  }, [irrigated_area, application_depth]);

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
        max={999999.99}
        system={system}
        control={control}
        hideLineUnitSeparator={true}
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.DEFAULT_APPLICATION_DEPTH')}
        sm
        style={{ marginTop: '10px', marginBottom: '30px' }}
        hookFormRegister={register(DEFAULT_LOCATION_APPLICATION_DEPTH)}
      />
      <Unit
        register={modalState.register}
        displayUnitName={PERCENTAGE_LOCATION_IRRIGATED_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.PERCENTAGE_LOCATION_TO_BE_IRRIGATED')}
        hookFormSetValue={modalState.setValue}
        hookFormGetValue={modalState.getValues}
        hookFromWatch={modalState.watch}
        name={PERCENTAGE_LOCATION_IRRIGATED}
        unitType={percentage_location}
        max={100}
        system={system}
        control={modalState.control}
        hideLineUnitSeparator={true}
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
          required
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
          required
          disabled={true}
        />
      </div>
      <TotalWaterUsage totalWaterUsage={totalWaterUsage} />
    </>
  );
};

const WaterUseModal = ({
  measurementType,
  system,
  setTotalWaterUsage,
  totalWaterUsage,
  formState,
}) => {
  if (measurementType === 'VOLUME')
    return (
      <WaterUseVolumeCalculator
        system={system}
        totalWaterUsage={totalWaterUsage}
        setTotalWaterUsage={setTotalWaterUsage}
        formState={formState}
      />
    );
  if (measurementType === 'DEPTH')
    return (
      <WaterUseDepthCalculator
        system={system}
        totalWaterUsage={totalWaterUsage}
        setTotalWaterUsage={setTotalWaterUsage}
        formState={formState}
      />
    );
};

export default function WaterUsageCalculatorModal({
  dismissModal,
  measurementType,
  system,
  handleModalSubmit,
  totalWaterUsage,
  setTotalWaterUsage,
  formState,
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
        totalWaterUsage={totalWaterUsage}
        setTotalWaterUsage={setTotalWaterUsage}
        formState={formState}
      />
    </ModalComponent>
  );
}

WaterUsageCalculatorModal.propTypes = {
  dismissModal: PropTypes.func,
  measurementType: PropTypes.string,
};
