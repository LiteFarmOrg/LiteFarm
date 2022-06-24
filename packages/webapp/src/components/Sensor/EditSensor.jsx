import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import CropHeader from '../Crop/CropHeader.jsx';
import { useTranslation } from 'react-i18next';
import Button from '../Form/Button';
import { Label, Info } from '../Typography';
import Layout from '../Layout';
import PropTypes from 'prop-types';
import PageTitle from '../PageTitle/v2';
import styles from './styles.module.scss';
import RouterTab from '../RouterTab';
import { useForm, Controller } from 'react-hook-form';
import { container_planting_depth } from '../../util/convert-units/unit';
import { getDateInputFormat } from '../../util/moment';
import Unit from '../Form/Unit';
import InputAutoSize from '../Form/InputAutoSize';
import Input, { getInputErrors, numberOnKeyDown } from '../Form/Input';
import Rating from '../Rating';
import { integerOnKeyDown } from '../Form/Input';
import FilterPillSelect from '../Filter/FilterPillSelect';
import Form from '../Form';
import ReactSelect from '../Form/ReactSelect';
import { Error } from '../Typography';
import { FormHelperText } from '@material-ui/core';

export default function UpdateSensor({
  history,
  match,
  onBack,
  disabled,
  onSubmit,
  system,
  filter,
  filterRef,
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
      brand: 'ensemble_scientific',
      sensor_name: 'Input container data',
      latitude: '1',
      longtitude: '2',
      reading_types: '',
      external_identifier: 'Get container value',
    },
    shouldUnregister: false,
    mode: 'onChange',
  });

  const integrating_partners = [{ value: 'ensemble_scientific', label: t('Ensemble Scientific') }];

  const BRAND = 'brand';
  const DEPTH = 'depth';
  const DEPTH_UNIT = 'depth_unit';
  const EXTERNAL_IDENTIFIER = 'external_identifier';
  const HARDWARE_VERSION = 'hardware_version';
  const MODEL = 'model';
  const PART_NUMBER = 'part_number';
  const SENSOR_NAME = 'sensor_name';
  const LATITUDE = 'latitude';
  const LONGTITUDE = 'longtitude';
  const READING_TYPES = 'reading_types';

  const [isDirty, setIsDirty] = useState(true);
  const firstUpdate = useRef(true);

  const onChange = () => {
    console.log(getValues(READING_TYPES));
    console.log('onChange fired');
    setIsDirty(!isDirty);
    setValue(READING_TYPES, filterRef.current);
    console.log(getValues(READING_TYPES));
  };

  // useLayoutEffect(() => {
  //   if (firstUpdate.current) {
  //     console.log('True ran')
  //     firstUpdate.current = false;
  //   } else {
  //     console.log('False ran')
  //     setValue(READING_TYPES, filterRef.current);
  //   }

  // }, [watch(READING_TYPES)])

  return (
    <>
      <Layout>
        <PageTitle
          title={`Sensor Name - Use Selector Sensor name`}
          style={{ paddingBottom: '20px' }}
          onGoBack={onBack}
        />
      </Layout>

      <Form
        onSubmit={handleSubmit(onSubmit)}
        buttonGroup={
          <>
            {
              <Button disabled={!isValid} fullLength type={'submit'}>
                {t('common:UPDATE')}
              </Button>
            }
          </>
        }
      >
        <InputAutoSize
          label={t('SENSOR.SENSOR_NAME')}
          hookFormRegister={register(SENSOR_NAME, {
            required: true,
          })}
          errors={errors[SENSOR_NAME]?.message}
          style={{ paddingBottom: '40px' }}
          disabled={disabled}
          required
        />

        <div className={styles.row}>
          <Input
            style={{ minWidth: '100px' }}
            label={t('SENSOR.LATITUDE')}
            hookFormRegister={register(LATITUDE, {
              max: {
                value: 90,
                message: t('SENSOR.VALIDATION.SENSOR_LATITUDE'),
              },
              min: {
                value: -90,
                message: t('SENSOR.VALIDATION.SENSOR_LATITUDE'),
              },
              required: true,
              valueAsNumber: true,
            })}
            errors={getInputErrors(errors, LATITUDE)}
          />
          <Input
            label={t('SENSOR.LONGTITUDE')}
            style={{ minWidth: '100px' }}
            hookFormRegister={register(LONGTITUDE, {
              max: {
                value: 120,
                message: t('SENSOR.VALIDATION.SENSOR_LONGITUDE'),
              },
              min: {
                value: -120,
                message: t('SENSOR.VALIDATION.SENSOR_LONGITUDE'),
              },
              required: true,
              valueAsNumber: true,
            })}
            errors={getInputErrors(errors, LONGTITUDE)}
          />
        </div>
        <FilterPillSelect
          hookFormRegister={register(READING_TYPES, {
            required: true,
          })}
          subject={filter.subject}
          options={filter.options}
          filterKey={filter.filterKey}
          style={{ marginBottom: '32px' }}
          filterRef={filterRef}
          key={filter.filterKey}
          // shouldReset={shouldReset}
          onChange={onChange}
        />

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
                options={integrating_partners}
                label={t('SENSOR.BRAND')}
                required={true}
                isDisabled
                defaultValue={integrating_partners[0]}
              />
              <Info style={{ marginBottom: '24px' }}>{t('SENSOR.BRAND_HELPTEXT')}</Info>
            </>
          )}
        />

        <InputAutoSize
          hookFormRegister={register(MODEL, {})}
          label={t('SENSOR.MODEL')}
          style={{ paddingBottom: '40px' }}
          optional
        />

        <Input
          hookFormRegister={register(EXTERNAL_IDENTIFIER, {})}
          label={t('SENSOR.EXTERNAL_IDENTIFIER')}
          style={{ paddingBottom: '40px' }}
          disabled
          info={t('SENSOR.MODEL_HELPTEXT')}
          defaultValue={EXTERNAL_IDENTIFIER}
        />

        <InputAutoSize
          hookFormRegister={register(PART_NUMBER, {})}
          label={t('SENSOR.PART_NUMBER')}
          style={{ paddingBottom: '40px' }}
          optional
        />

        <InputAutoSize
          hookFormRegister={register(HARDWARE_VERSION, {})}
          label={t('SENSOR.HARDWARE_VERSION')}
          style={{ paddingBottom: '40px' }}
          optional
        />
      </Form>
    </>
  );
}

UpdateSensor.prototype = {
  onBack: PropTypes.func,
  variety: PropTypes.object,
  plan: PropTypes.object,
  isAdmin: PropTypes.bool,
  history: PropTypes.object,
  match: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']).isRequired,
};
