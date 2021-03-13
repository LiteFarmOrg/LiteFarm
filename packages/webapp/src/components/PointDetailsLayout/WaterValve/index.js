import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PointDetails from '..';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { locationInfoSelector } from '../../../containers/mapSlice';
import Radio from '../../Form/Radio';
import Input from '../../Form/Input';
import { waterValveEnum } from '../../../containers/waterValveSlice';

export default function PureWaterValve({ history, submitForm }) {
  const { t } = useTranslation();
  const { point } = useSelector(locationInfoSelector);
  const [maxFlowRate, setFlowRate] = useState(0);
  const { handleSubmit, setValue, register, watch } = useForm({
    mode: 'onChange',
  });
  const onError = (data) => {};

  const setFlowRateValue = (flowRate) => {
    setFlowRate(flowRate);
  };
  const onSubmit = (data) => {
    const formData = {
      name: data.name,
      point: point,
      notes: data.notes,
      type: 'water_valve',
      source: waterValveSourceSelection,
      flow_rate: maxFlowRate,
    };
    submitForm({ formData });
  };

  const WATER_TYPE = 'water_type';
  const waterValveSourceSelection = watch(WATER_TYPE, 'Groundwater');

  return (
    <PointDetails
      name={t('FARM_MAP.WATER_VALVE.NAME')}
      pointName={waterValveEnum.name}
      title={t('FARM_MAP.WATER_VALVE.TITLE')}
      history={history}
      setValue={setValue}
      submitForm={onSubmit}
      onError={onError}
      handleSubmit={handleSubmit}
      register={register}
    >
      <div>
        <p style={{ marginBottom: '25px' }}>{t('FARM_MAP.WATER_VALVE.WATER_VALVE_TYPE')}</p>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.WATER_VALVE.MUNICIPAL_WATER')}
            defaultChecked={true}
            name={waterValveEnum.source}
            value={'Municipal water'}
            inputRef={register({ required: false })}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.WATER_VALVE.SURFACE_WATER')}
            name={waterValveEnum.source}
            value={'Surface water'}
            inputRef={register({ required: false })}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.WATER_VALVE.GROUNDWATER')}
            name={waterValveEnum.source}
            value={'Groundwater'}
            inputRef={register({ required: false })}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('FARM_MAP.WATER_VALVE.RAIN_WATER')}
            name={waterValveEnum.source}
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
          name={waterValveEnum.flow_rate}
          onChange={(e) => setFlowRateValue(e.target.value)}
        />
      </div>
    </PointDetails>
  );
}
