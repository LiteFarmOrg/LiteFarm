/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../Form/Button';
import Layout from '../Layout';
import PropTypes from 'prop-types';
import PageTitle from '../PageTitle/v2';
import styles from './styles.module.scss';
import { useForm, Controller } from 'react-hook-form';
import { container_planting_depth } from '../../util/convert-units/unit';
import Unit from '../Form/Unit';
import InputAutoSize from '../Form/InputAutoSize';
import Input, { getInputErrors } from '../Form/Input';
import FilterPillSelect from '../Filter/FilterPillSelect';
import Form from '../Form';
import ReactSelect from '../Form/ReactSelect';
import UpdateSensorModal from '../Modals/UpdateSensorModal';
import { Error } from '../Typography';

export default function UpdateSensor({
  onBack,
  disabled,
  onSubmit,
  system,
  filter,
  filterRef,
  sensorInfo,
}) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      sensor_name: sensorInfo.name,
      latitude: sensorInfo.point.lat,
      longtitude: sensorInfo.point.lng,
      external_identifier: sensorInfo.external_id,
      depth: sensorInfo.depth,
      depth_unit: sensorInfo.depth_unit,
      model: sensorInfo.model,
      reading_types: [],
    },
    shouldUnregister: false,
    mode: 'onChange',
  });

  const { brand_name } = sensorInfo;

  const BRAND = 'brand';
  const DEPTH = 'depth';
  const DEPTH_UNIT = 'depth_unit';
  const EXTERNAL_IDENTIFIER = 'external_identifier';
  const MODEL = 'model';
  const SENSOR_NAME = 'sensor_name';
  const LATITUDE = 'latitude';
  const LONGTITUDE = 'longtitude';
  const READING_TYPES = 'reading_types';

  const [isDirty, setIsDirty] = useState(false);
  const [filterState, setFilterState] = useState([]);
  const [isFilterValid, setIsFilterValid] = useState(true);
  const [readingTypesChanged, setIsReadingTypesChanged] = useState(false);

  const onChange = () => {
    setFilterState(filterRef.current);
    setIsDirty(!isDirty);
  };

  useEffect(() => {
    setValue(READING_TYPES, filterState);
    const e = Object.entries(filterState);
    if (e.length > 0) {
      let count = 0;
      for (let i = 0; i < 3; i++) {
        const f = Object.entries(e[0][1]);
        const g = Object.entries(f[i][1]);
        const h = g[0][1];
        if (h === true) {
          setIsFilterValid(true);
          setIsReadingTypesChanged(true);
          count++;
        }
      }
      count == 0 ? setIsFilterValid(false) : {};
    }
  }, [filterState, isDirty]);

  const [showAbandonModal, setShowAbandonModal] = useState(false);

  return (
    <>
      <Layout>
        <PageTitle title={sensorInfo.name} style={{ paddingBottom: '20px' }} onGoBack={onBack} />
      </Layout>

      <Form
        onSubmit={handleSubmit(() => {
          if (readingTypesChanged) {
            setShowAbandonModal(true);
          } else {
            onSubmit(getValues());
          }
        })}
        buttonGroup={
          <>
            {
              <Button disabled={!isValid || !isFilterValid} fullLength type={'submit'}>
                {t('common:UPDATE')}
              </Button>
            }
          </>
        }
      >
        <InputAutoSize
          label={t('SENSOR.SENSOR_NAME')}
          hookFormRegister={register(SENSOR_NAME, {
            pattern: {
              value: /^[ A-Za-z0-9_-]{1,100}$/,
              message: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_NAME'),
            },
            required: true,
          })}
          errors={getInputErrors(errors, SENSOR_NAME)}
          style={{ paddingBottom: '40px' }}
          disabled={disabled}
        />

        <div className={styles.row}>
          <Input
            style={{ minWidth: '100px' }}
            label={t('SENSOR.LATITUDE')}
            hookFormRegister={register(LATITUDE, {
              // check if latitude is within -85 - +85 and within 10 decimal places
              pattern: {
                value:
                  /^(\+|-)?(?:85(?:(?:\.0{1,10})?)|(?:[0-9]|[1-7][0-9]|8[0-4])(?:(?:\.[0-9]{1,10})?))$/,
                message: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_LATITUDE'),
              },
              required: true,
            })}
            errors={getInputErrors(errors, LATITUDE)}
          />
          <Input
            label={t('SENSOR.LONGTITUDE')}
            style={{ minWidth: '100px' }}
            hookFormRegister={register(LONGTITUDE, {
              // check if longtitude is within -180 - +180 and within 10 decimal places
              pattern: {
                value:
                  /^(\+|-)?(?:180(?:(?:\.0{1,10})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,10})?))$/,
                message: t('FARM_MAP.BULK_UPLOAD_SENSORS.VALIDATION.SENSOR_LONGITUDE'),
              },
              required: true,
            })}
            errors={getInputErrors(errors, LONGTITUDE)}
          />
        </div>
        <FilterPillSelect
          subject={filter.subject}
          options={filter.options}
          filterKey={filter.filterKey}
          style={{ marginBottom: !isFilterValid ? '0' : '32px' }}
          filterRef={filterRef}
          key={filter.filterKey}
          // shouldReset={shouldReset}
          onChange={onChange}
        />
        {!isFilterValid && (
          <Error style={{ marginBottom: '32px' }}>{t(`SENSOR.VALIDATION.READING_TYPES`)}</Error>
        )}

        <Unit
          register={register}
          label={t('SENSOR.DEPTH')}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          name={DEPTH}
          displayUnitName={DEPTH_UNIT}
          unitType={container_planting_depth}
          max={10000}
          system={system}
          control={control}
          style={{ marginBottom: '40px' }}
          optional
        />

        <Controller
          control={control}
          name={BRAND}
          render={() => (
            <>
              <ReactSelect
                label={t('SENSOR.BRAND')}
                required={true}
                isDisabled
                placeholder={brand_name}
                defaultValue={brand_name}
                toolTipContent={t('SENSOR.BRAND_HELPTEXT')}
                style={{ marginBottom: '24px' }}
              />
            </>
          )}
        />

        <InputAutoSize
          hookFormRegister={register(MODEL, {})}
          label={t('SENSOR.MODEL')}
          style={{ paddingBottom: '40px' }}
          disabled
        />

        <Input
          hookFormRegister={register(EXTERNAL_IDENTIFIER, {})}
          label={t('SENSOR.EXTERNAL_IDENTIFIER')}
          style={{ paddingBottom: '40px' }}
          disabled
          toolTipContent={t('SENSOR.MODEL_HELPTEXT')}
          defaultValue={EXTERNAL_IDENTIFIER}
        />

        {showAbandonModal && (
          <UpdateSensorModal
            dismissModal={() => setShowAbandonModal(false)}
            onChange={() => onSubmit(getValues())}
          />
        )}
      </Form>
    </>
  );
}

UpdateSensor.prototype = {
  onBack: PropTypes.func,
  disabled: PropTypes.bool,
  onSubmit: PropTypes.func,
  history: PropTypes.object,
  match: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']).isRequired,
};
