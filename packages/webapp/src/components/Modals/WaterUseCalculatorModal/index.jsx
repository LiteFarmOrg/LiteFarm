import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import { ReactComponent as Person } from '../../../assets/images/task/Person.svg';
import styles from '../QuickAssignModal/styles.module.scss';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import Unit from '../../Form/Unit';
import {
  area_perimeter,
  area_total_area,
  water_valve_flow_rate,
} from '../../../util/convert-units/unit';
import { useForm } from 'react-hook-form';
import Checkbox from '../../Form/Checkbox';
import { fieldEnum as areaEnum } from '../../../containers/constants';
import { Label } from '../../Typography';

const TotalWaterUsage = ({ totalWaterUsage }) => {
  const { t } = useTranslation();
  const labelStyle = {
    fontSize: '16px',
    lineHeight: '20px',
    color: 'var(--teal900)',
  };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        width: '100%',
        border: `2px solid var(--teal700)`,
        borderRadius: '4px',
        color: 'var(--teal700)',
        marginLeft: 'auto',
      }}
    >
      <Label style={labelStyle}>{t('ADD_TASK.IRRIGATION_VIEW.TOTAL_WATER_USAGE')}</Label>
      <Label style={labelStyle}>{totalWaterUsage} l</Label>
    </div>
  );
};

const WaterUseVolumeCalculator = ({ system, persistedFormData, useHookFormPersist }) => {
  const { t } = useTranslation();
  const { register, getValues, watch, control, setValue } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      measurement_type: '',
      ...persistedFormData,
    },
  });
  const FLOW_RATE = 'flow_rate';
  const FLOW_RATE_UNIT = 'flow_rate_unit';
  const DEFAULT_LOCATION_FLOW_RATE = 'default_location_flow_rate';
  const ESTIMATED_DURATION = 'estimated_duration';
  const ESTIMATED_DURATION_UNIT = 'estimated_duration_unit';

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
        max={999999999}
        system={system}
        control={control}
        disabled={false}
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
        unitType={water_valve_flow_rate}
        max={999999999}
        system={system}
        control={control}
        style={{ paddingBottom: '32px' }}
        disabled={false}
      />

      <TotalWaterUsage totalWaterUsage={7890} />
    </>
  );
};

const WaterUseDepthCalculator = ({ system, persistedFormData, useHookFormPersist }) => {
  const { t } = useTranslation();
  const { register, getValues, watch, control, setValue } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      measurement_type: '',
      ...persistedFormData,
    },
  });

  const APPLICATION_DEPTH = 'application_depth';
  const APPLICATION_DEPTH_UNIT = 'application_depth_unit';
  const DEFAULT_LOCATION_APPLICATION_DEPTH = 'default_location_application_depth';
  const LOCATION_IRRIGATED = 'location_irrigated';
  const LOCATION_IRRIGATED_UNIT = 'location_irrigated_unit';
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
        unitType={water_valve_flow_rate}
        max={999999999}
        system={system}
        control={control}
        disabled={false}
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.DEFAULT_APPLICATION_DEPTH')}
        sm
        style={{ marginTop: '10px', marginBottom: '30px' }}
        hookFormRegister={register(DEFAULT_LOCATION_APPLICATION_DEPTH)}
      />

      <Unit
        register={register}
        displayUnitName={LOCATION_IRRIGATED_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.PERCENTAGE_LOCATION_TO_BE_IRRIGATED')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={LOCATION_IRRIGATED}
        unitType={water_valve_flow_rate}
        max={999999999}
        system={system}
        control={control}
        disabled={false}
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
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          name={areaEnum.total_area}
          displayUnitName={areaEnum.total_area_unit}
          unitType={area_total_area}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          // defaultValue={total_area}
          disabled={true}
        />

        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
          name={areaEnum.perimeter}
          displayUnitName={areaEnum.perimeter_unit}
          unitType={area_perimeter}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          // defaultValue={perimeter}
          disabled={true}
        />
      </div>
      <TotalWaterUsage totalWaterUsage={86969} />
    </>
  );
};

const WaterUseModal = ({ measurementType, system }) => {
  if (measurementType === 'VOLUME') return <WaterUseVolumeCalculator system={system} />;
  return <WaterUseDepthCalculator system={system} />;
};

export default function WaterUseCalculatorModal({ dismissModal, measurementType, system }) {
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

          <Button className={styles.button} color="primary" sm>
            {t('common:SAVE')}
          </Button>
        </>
      }
      icon={<Person />}
      tooltipContent={`${t(
        'ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR_INFO.PHRASE1',
      )} ${measurementType}. ${t(
        'ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR_INFO.PHRASE2',
      )} ${measurementType} ${t('ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR_INFO.PHRASE3')}`}
    >
      <WaterUseModal system={system} measurementType={measurementType} />
    </ModalComponent>
  );
}
WaterUseCalculatorModal.propTypes = {
  dismissModal: PropTypes.func,
  measurementType: PropTypes.string,
};
