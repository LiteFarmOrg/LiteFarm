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

export default function UpdateSensor({ onBack, disabled, onSubmit, system, filter, filterRef }) {
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
  const MODEL = 'model';
  const SENSOR_NAME = 'sensor_name';
  const LATITUDE = 'latitude';
  const LONGTITUDE = 'longtitude';
  const READING_TYPES = 'reading_types';

  const [isDirty, setIsDirty] = useState(false);
  const [filterState, setFilterState] = useState([]);
  const [isFilterValid, setIsFilterValid] = useState(false);

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
        <PageTitle
          title={`Sensor Name - Use Selector Sensor name`}
          style={{ paddingBottom: '20px' }}
          onGoBack={onBack}
        />
      </Layout>

      <Form
        onSubmit={handleSubmit(() => setShowAbandonModal(true))}
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
                value: 180,
                message: t('SENSOR.VALIDATION.SENSOR_LONGITUDE'),
              },
              min: {
                value: -180,
                message: t('SENSOR.VALIDATION.SENSOR_LONGITUDE'),
              },
              required: true,
              valueAsNumber: true,
            })}
            errors={getInputErrors(errors, LONGTITUDE)}
          />
        </div>
        <FilterPillSelect
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
