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
import {
  barnEnum,
  fieldEnum,
  gardenEnum,
  greenhouseEnum,
  surfaceWaterEnum,
} from '../../containers/constants';
import styles from './styles.module.scss';
import Leaf from '../../assets/images/farmMapFilter/Leaf.svg';

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
};

export default ExtraLocationFormFieldsMap;
