import React from 'react';
import { useTranslation } from 'react-i18next';
import PointDetails from '../index';
import { useForm } from 'react-hook-form';
import Radio from '../../../Form/Radio';
import Unit from '../../../Form/Unit';
import { waterValveEnum } from '../../../../containers/constants';
import { water_valve_flow_rate } from '../../../../util/unit';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import { getPersistPath } from '../../utils';

export default function PureWaterValve({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  useHookFormPersist,
}) {
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
  const persistedPath = getPersistPath('water_valve', match, {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  });
  const {
    persistedData: { point, type },
  } = useHookFormPersist(persistedPath, getValues, setValue, !!isCreateLocationPage);

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
      isCreateLocationPage={isCreateLocationPage}
      isViewLocationPage={isViewLocationPage}
      isEditLocationPage={isEditLocationPage}
      setValue={setValue}
      submitForm={onSubmit}
      onError={onError}
      handleSubmit={handleSubmit}
      register={register}
      errors={errors}
      disabled={disabled}
      buttonGroup={<LocationButtons disabled={disabled} />}
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
            disabled={isViewLocationPage}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.WATER_VALVE.SURFACE_WATER')}
            name={waterValveEnum.source}
            value={'Surface water'}
            inputRef={register({ required: false })}
            disabled={isViewLocationPage}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '16px' }}
            label={t('FARM_MAP.WATER_VALVE.GROUNDWATER')}
            name={waterValveEnum.source}
            value={'Groundwater'}
            inputRef={register({ required: false })}
            disabled={isViewLocationPage}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '30px' }}
            label={t('FARM_MAP.WATER_VALVE.RAIN_WATER')}
            name={waterValveEnum.source}
            value={'Rain water'}
            inputRef={register({ required: false })}
            disabled={isViewLocationPage}
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
          disabled={isViewLocationPage}
        />
      </div>
    </PointDetails>
  );
}
