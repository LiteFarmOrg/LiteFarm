import React from 'react';
import { useTranslation } from 'react-i18next';
import PointDetails from '..';
import { useForm } from 'react-hook-form';
import Radio from '../../Form/Radio';
import Unit from '../../Form/Unit';
import { waterValveEnum } from '../../../containers/constants';
import { water_valve_flow_rate } from '../../../util/unit';
import { Label } from "../../Typography";

export default function PureWaterValve({ history, submitForm, system, useHookFormPersist }) {
  const { t } = useTranslation();

  const {
    handleSubmit,
    setValue,
    register,
    watch,
    getValues,
    setError,
    control,
    errors,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const {
    persistedData: { point, type },
  } = useHookFormPersist(['/map'], getValues, setValue);
  const onError = (data) => {};
  const disabled = !isValid || !isDirty;

  const onSubmit = (data) => {
    const formData = {
      type,
      point,
      ...data,
    };
    submitForm({ formData });
  };

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
      errors={errors}
      disabled={disabled}
    >
      <div>
        <Label style={{ marginBottom: '25px' }}>{t('FARM_MAP.WATER_VALVE.WATER_VALVE_TYPE')}</Label>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.WATER_VALVE.MUNICIPAL_WATER')}
            defaultChecked={true}
            name={waterValveEnum.source}
            value={'Municipal water'}
            inputRef={register({ required: false })}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.WATER_VALVE.SURFACE_WATER')}
            name={waterValveEnum.source}
            value={'Surface water'}
            inputRef={register({ required: false })}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.WATER_VALVE.GROUNDWATER')}
            name={waterValveEnum.source}
            value={'Groundwater'}
            inputRef={register({ required: false })}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '30px' }}
            label={t('FARM_MAP.WATER_VALVE.RAIN_WATER')}
            name={waterValveEnum.source}
            value={'Rain water'}
            inputRef={register({ required: false })}
          />
        </div>
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
          hookFormSetError={setError}
          hookFromWatch={watch}
          control={control}
          optional
        />
      </div>
    </PointDetails>
  );
}
