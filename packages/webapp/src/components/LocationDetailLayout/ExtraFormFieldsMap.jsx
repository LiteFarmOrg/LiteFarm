/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Label } from '../Typography';
import RadioGroup from '../Form/RadioGroup';
import InputBaseLabel from '../Form/InputBase/InputBaseLabel';
import Input, { getInputErrors } from '../Form/Input';
import Unit from '../Form/Unit';
import {
  barnEnum,
  bufferZoneEnum,
  fenceEnum,
  fieldEnum,
  gardenEnum,
  greenhouseEnum,
  surfaceWaterEnum,
  watercourseEnum,
  waterValveEnum,
} from '../../containers/constants';
import styles from './styles.module.scss';
import Leaf from '../../assets/images/farmMapFilter/Leaf.svg';
import {
  area_total_area,
  line_length,
  line_width,
  water_valve_flow_rate,
  watercourse_width,
} from '../../util/convert-units/unit';
import { buffer } from 'd3';

// Areas Children

function BarnDetailsChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const { control } = useFormContext();
  return (
    <>
      <div>
        <div className={styles.radioLabel}>
          <Label>{t('FARM_MAP.BARN.WASH_PACK')}</Label>
          <Label sm>{t('common:OPTIONAL')}</Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={barnEnum.wash_and_pack}
            hookFormControl={control}
          />
        </div>
      </div>
      <div>
        <div className={styles.radioLabel}>
          <Label>{t('FARM_MAP.BARN.COLD_STORAGE')}</Label>
          <Label sm>{t('common:OPTIONAL')}</Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={barnEnum.cold_storage}
            hookFormControl={control}
          />
        </div>
      </div>
      <div>
        <div className={styles.radioLabel}>
          <Label>{t('FARM_MAP.BARN.ANIMALS')}</Label>
          <Label sm>{t('common:OPTIONAL')}</Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={barnEnum.used_for_animals}
            hookFormControl={control}
          />
        </div>
      </div>
    </>
  );
}

function FieldDetailsChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const { control, watch, register } = useFormContext();
  const fieldTypeSelection = watch(fieldEnum.organic_status);
  const [transitionalDate, setTransitionalDate] = useState(watch(fieldEnum.transition_date));
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Label style={{ paddingRight: '10px', display: 'inline-block', fontSize: '16px' }}>
          {t('FARM_MAP.FIELD.FIELD_TYPE')}
        </Label>
        <img src={Leaf} style={{ display: 'inline-block' }} />
      </div>

      <RadioGroup
        required={true}
        disabled={isViewLocationPage}
        hookFormControl={control}
        name={fieldEnum.organic_status}
        radios={[
          {
            label: t('FARM_MAP.FIELD.NON_ORGANIC'),
            value: 'Non-Organic',
          },
          {
            label: t('FARM_MAP.FIELD.ORGANIC'),
            value: 'Organic',
          },
          {
            label: t('FARM_MAP.FIELD.TRANSITIONING'),
            value: 'Transitional',
          },
        ]}
      />

      <div style={{ paddingBottom: '20px' }}>
        {fieldTypeSelection === 'Transitional' && (
          <Input
            style={{ paddingBottom: '16px' }}
            type={'date'}
            label={t('FARM_MAP.FIELD.DATE')}
            hookFormRegister={register(fieldEnum.transition_date, { required: true })}
            disabled={isViewLocationPage}
            onChange={(e) => setTransitionalDate(e.target.value)}
            value={transitionalDate}
          />
        )}
      </div>
    </div>
  );
}

function GardenDetailsChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const {
    control,
    watch,
    register,
    formState: { errors },
  } = useFormContext();
  const gardenTypeSelection = watch(gardenEnum.organic_status);
  const [transitionalDate, setTransitionalDate] = useState(watch(gardenEnum.transition_date));
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Label
          style={{
            paddingRight: '10px',
            fontSize: '16px',
            lineHeight: '20px',
            display: 'inline-block',
          }}
        >
          {t('FARM_MAP.GARDEN.GARDEN_TYPE')}
        </Label>
        <img src={Leaf} style={{ display: 'inline-block' }} />
      </div>
      <RadioGroup
        required={true}
        disabled={isViewLocationPage}
        hookFormControl={control}
        name={gardenEnum.organic_status}
        radios={[
          {
            label: t('FARM_MAP.GARDEN.NON_ORGANIC'),
            value: 'Non-Organic',
          },
          {
            label: t('FARM_MAP.GARDEN.ORGANIC'),
            value: 'Organic',
          },
          {
            label: t('FARM_MAP.GARDEN.TRANSITIONING'),
            value: 'Transitional',
          },
        ]}
      />
      <div style={{ paddingBottom: '20px' }}>
        {gardenTypeSelection === 'Transitional' && (
          <Input
            type={'date'}
            label={t('FARM_MAP.GARDEN.DATE')}
            hookFormRegister={register(gardenEnum.transition_date, { required: true })}
            style={{ paddingTop: '16px', paddingBottom: '20px' }}
            disabled={isViewLocationPage}
            errors={getInputErrors(errors, gardenEnum.transition_date)}
            onChange={(e) => setTransitionalDate(e.target.value)}
            value={transitionalDate}
          />
        )}
      </div>
    </div>
  );
}

function GreenhouseDetailsChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const { register, watch, control } = useFormContext();
  const greenhouseTypeSelection = watch(greenhouseEnum.organic_status);
  const [transitionalDate, setTransitionalDate] = useState(watch(greenhouseEnum.transition_date));
  return (
    <div>
      <InputBaseLabel
        label={t('FARM_MAP.GREENHOUSE.GREENHOUSE_TYPE')}
        hasLeaf={true}
        labelStyles={{
          marginBottom: '12px',
          fontSize: '16px',
        }}
        leftJustified
      />
      <RadioGroup
        required={true}
        disabled={isViewLocationPage}
        hookFormControl={control}
        name={greenhouseEnum.organic_status}
        radios={[
          {
            label: t('FARM_MAP.GREENHOUSE.NON_ORGANIC'),
            value: 'Non-Organic',
          },
          {
            label: t('FARM_MAP.GREENHOUSE.ORGANIC'),
            value: 'Organic',
          },
          {
            label: t('FARM_MAP.GREENHOUSE.TRANSITIONING'),
            value: 'Transitional',
          },
        ]}
      />

      <div style={{ paddingBottom: greenhouseTypeSelection === 'Organic' ? '9px' : '20px' }}>
        {greenhouseTypeSelection === 'Transitional' && (
          <Input
            type={'date'}
            label={t('FARM_MAP.GREENHOUSE.DATE')}
            hookFormRegister={register(greenhouseEnum.transition_date, { required: true })}
            style={{ paddingTop: '16px', paddingBottom: '20px' }}
            disabled={isViewLocationPage}
            onChange={(e) => setTransitionalDate(e.target.value)}
            value={transitionalDate}
          />
        )}
      </div>
      <div>
        {greenhouseTypeSelection === 'Organic' && (
          <div>
            <InputBaseLabel
              label={t('FARM_MAP.GREENHOUSE.SUPPLEMENTAL_LIGHTING')}
              hasLeaf={true}
              optional={true}
              labelStyles={{
                marginBottom: '12px',
                fontSize: '16px',
              }}
              leftJustified
            />
            <div style={{ marginBottom: '16px' }}>
              <RadioGroup
                row
                disabled={isViewLocationPage}
                name={greenhouseEnum.supplemental_lighting}
                hookFormControl={control}
              />
            </div>
            <InputBaseLabel
              label={t('FARM_MAP.GREENHOUSE.CO2_ENRICHMENT')}
              hasLeaf={true}
              optional={true}
              labelStyles={{
                marginBottom: '12px',
                fontSize: '16px',
              }}
              leftJustified
            />

            <div style={{ marginBottom: '16px' }}>
              <RadioGroup
                row
                disabled={isViewLocationPage}
                name={greenhouseEnum.co2_enrichment}
                hookFormControl={control}
              />
            </div>
            <InputBaseLabel
              label={t('FARM_MAP.GREENHOUSE.GREENHOUSE_HEATED')}
              hasLeaf={true}
              optional={true}
              labelStyles={{
                marginBottom: '12px',
                fontSize: '16px',
              }}
              leftJustified
            />
            <div style={{ marginBottom: '16px' }}>
              <RadioGroup
                row
                disabled={isViewLocationPage}
                name={greenhouseEnum.greenhouse_heated}
                hookFormControl={control}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SurfaceWaterDetailsChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const { control } = useFormContext();
  return (
    <div>
      <div className={styles.radioLabel}>
        <Label>{t('FARM_MAP.BARN.ANIMALS')}</Label>
        <Label sm>{t('common:OPTIONAL')}</Label>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <RadioGroup
          row
          disabled={isViewLocationPage}
          name={surfaceWaterEnum.used_for_irrigation}
          hookFormControl={control}
        />
      </div>
    </div>
  );
}

// Lines Children
function BufferZoneDetailsChildren({ system, isViewLocationPage, isEditLocationPage }) {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <div>
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1, marginBottom: '40px' } }}
          label={t('FARM_MAP.BUFFER_ZONE.WIDTH')}
          name={bufferZoneEnum.width}
          displayUnitName={bufferZoneEnum.width_unit}
          errors={errors[bufferZoneEnum.width]}
          unitType={line_width}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={!isEditLocationPage}
        />
      </div>
      <div
        style={{
          flexDirection: 'row',
          display: 'inline-flex',
          paddingBottom: '40px',
          width: '100%',
          gap: '16px',
        }}
      >
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          name={bufferZoneEnum.total_area}
          displayUnitName={bufferZoneEnum.total_area_unit}
          errors={errors[bufferZoneEnum.total_area]}
          unitType={area_total_area}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={isViewLocationPage}
        />
      </div>
    </div>
  );
}

function FenceDetailsChildren({ system, isViewLocationPage }) {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <div>
        <Unit
          style={{ marginBottom: '40px' }}
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('FARM_MAP.FENCE.LENGTH')}
          name={fenceEnum.length}
          displayUnitName={fenceEnum.length_unit}
          errors={errors[fenceEnum.length]}
          unitType={line_length}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={isViewLocationPage}
        />
      </div>
      <div>
        <InputBaseLabel
          label={t('FARM_MAP.FENCE.PRESSURE_TREATED')}
          hasLeaf={true}
          optional={true}
          labelStyles={{
            marginBottom: '12px',
            fontSize: '16px',
          }}
        />
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={fenceEnum.pressure_treated}
            hookFormControl={control}
          />
        </div>
      </div>
    </div>
  );
}

function WatercourseDetailsChildren({ system, isViewLocationPage, isEditLocationPage }) {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <div>
        <Unit
          style={{ marginBottom: '40px', zIndex: 2 }}
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('FARM_MAP.WATERCOURSE.LENGTH')}
          name={watercourseEnum.length}
          displayUnitName={watercourseEnum.length_unit}
          errors={errors[watercourseEnum.length]}
          unitType={line_length}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={isViewLocationPage}
        />
      </div>
      <div
        style={{
          flexDirection: 'row',
          display: 'inline-flex',
          paddingBottom: '40px',
          width: '100%',
          gap: '16px',
        }}
      >
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          name={watercourseEnum.total_area}
          displayUnitName={watercourseEnum.total_area_unit}
          errors={errors[watercourseEnum.total_area]}
          unitType={area_total_area}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={isViewLocationPage}
        />
      </div>
      <div>
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1, marginBottom: '40px' } }}
          label={t('FARM_MAP.WATERCOURSE.WIDTH')}
          name={watercourseEnum.width}
          displayUnitName={watercourseEnum.width_unit}
          errors={errors[watercourseEnum.width]}
          unitType={line_width}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={!isEditLocationPage}
        />
      </div>
      <div>
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1, marginBottom: '40px' } }}
          label={t('FARM_MAP.WATERCOURSE.BUFFER')}
          name={watercourseEnum.buffer_width}
          displayUnitName={watercourseEnum.buffer_width_unit}
          errors={errors[watercourseEnum.buffer_width]}
          unitType={watercourse_width}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={!isEditLocationPage}
        />
      </div>
      <div>
        <div className={styles.radioLabel}>
          <Label>{t('FARM_MAP.WATERCOURSE.IRRIGATION')}</Label>
          <Label sm>{t('common:OPTIONAL')}</Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={watercourseEnum.used_for_irrigation}
            hookFormControl={control}
          />
        </div>
      </div>
    </div>
  );
}

// Points Children
function WaterValveDetailsChildren({ system, isViewLocationPage }) {
  const { t } = useTranslation();
  const {
    control,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <div className={styles.radioLabel}>
        <Label>{t('FARM_MAP.WATER_VALVE.WATER_VALVE_TYPE')}</Label>
        <Label sm>{t('common:OPTIONAL')}</Label>
      </div>
      <RadioGroup
        disabled={isViewLocationPage}
        hookFormControl={control}
        style={{ marginBottom: '14px' }}
        name={waterValveEnum.source}
        radios={[
          {
            label: t('FARM_MAP.WATER_VALVE.MUNICIPAL_WATER'),
            value: 'Municipal water',
          },
          {
            label: t('FARM_MAP.WATER_VALVE.SURFACE_WATER'),
            value: 'Surface water',
          },
          {
            label: t('FARM_MAP.WATER_VALVE.GROUNDWATER'),
            value: 'Groundwater',
          },
          {
            label: t('FARM_MAP.WATER_VALVE.RAIN_WATER'),
            value: 'Rain water',
          },
        ]}
      />

      <Unit
        register={register}
        classes={{ container: { flexGrow: 1, paddingBottom: '40px' } }}
        label={t('FARM_MAP.WATER_VALVE.MAX_FLOW_RATE')}
        name={waterValveEnum.flow_rate}
        displayUnitName={waterValveEnum.flow_rate_unit}
        errors={errors[waterValveEnum.flow_rate]}
        unitType={water_valve_flow_rate}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        optional
        disabled={isViewLocationPage}
      />
    </div>
  );
}

function SoilSampleLocationDetailsChildren({ persistedFormData }) {
  const { t } = useTranslation();

  return (
    <div className={styles.latLngContainer}>
      <Input
        label={t('FARM_MAP.SOIL_SAMPLE_LOCATION.LATITUDE')}
        disabled={true}
        value={persistedFormData?.point?.lat}
      />
      <Input
        label={t('FARM_MAP.SOIL_SAMPLE_LOCATION.LONGITUDE')}
        disabled={true}
        value={persistedFormData?.point?.lng}
      />
    </div>
  );
}

const ExtraLocationFormFieldsMap = {
  //areas
  barn: BarnDetailsChildren,
  ceremonial_area: null,
  farm_site_boundary: null,
  field: FieldDetailsChildren,
  garden: GardenDetailsChildren,
  greenhouse: GreenhouseDetailsChildren,
  natural_area: null,
  residence: null,
  surface_water: SurfaceWaterDetailsChildren,
  // lines
  buffer_zone: BufferZoneDetailsChildren,
  fence: FenceDetailsChildren,
  watercourse: WatercourseDetailsChildren,
  // points
  gate: null,
  soil_sample_location: SoilSampleLocationDetailsChildren,
  water_valve: WaterValveDetailsChildren,
};

export default ExtraLocationFormFieldsMap;
