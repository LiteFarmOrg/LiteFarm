import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PointDetails from '..';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { locationInfoSelector } from '../../../containers/mapSlice';
import Radio from '../../Form/Radio';
import Input from '../../Form/Input';

export default function PureWaterValve({ history, submitForm, pointType }) {
  const { t } = useTranslation();
  const { point } = useSelector(locationInfoSelector);
  const { handleSubmit, setValue, register, watch } = useForm({
    mode: 'onChange',
  });
  const onError = (data) => {};

  const onSubmit = (data) => {
    console.log(data);
    const formData = {
      name: data.name,
      point: point,
      notes: data.notes,
      type: 'water_valve',
      source: waterValveSourceSelection,
      flow_rate: data.flow_rate === '' ? 0 : parseInt(data.flow_rate),
    };
    submitForm({ formData });
  };

  const WATER_TYPE = 'water_type';
  const waterValveSourceSelection = watch(WATER_TYPE, 'Groundwater');

  return (
    <PointDetails
      name={t('FARM_MAP.WATER_VALVE.NAME')}
      title={t('FARM_MAP.WATER_VALVE.TITLE')}
      history={history}
      setValue={setValue}
      submitForm={onSubmit}
      onError={onError}
      handleSubmit={handleSubmit}
      register={register}
      pointType={pointType}
    >
      <div>
        <p style={{ marginBottom: '25px' }}>{t('FARM_MAP.WATER_VALVE.WATER_VALVE_TYPE')}</p>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.WATER_VALVE.MUNICIPAL_WATER')}
            defaultChecked={true}
            name={pointType.source}
            value={'Municipal water'}
            inputRef={register({ required: false })}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.WATER_VALVE.SURFACE_WATER')}
            name={pointType.source}
            value={'Surface water'}
            inputRef={register({ required: false })}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.WATER_VALVE.GROUNDWATER')}
            name={pointType.source}
            value={'Groundwater'}
            inputRef={register({ required: false })}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.WATER_VALVE.RAIN_WATER')}
            name={pointType.source}
            value={'Rain water'}
            inputRef={register({ required: false })}
          />
        </div>
        <Input
          label={t('FARM_MAP.WATER_VALVE.MAX_FLOW_RATE')}
          type="number"
          optional
          style={{ marginBottom: '40px' }}
          hookFormSetValue={setValue}
          name={pointType.flow_rate}
          inputRef={register({ required: false })}
        />
      </div>
    </PointDetails>
  );
}
