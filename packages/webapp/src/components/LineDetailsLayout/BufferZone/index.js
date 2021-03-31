import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import { bufferZoneEnum } from '../../../containers/constants';
import Unit from '../../Form/Unit';
import { line_width } from '../../../util/unit';

export default function PureBufferZone({ history, submitForm, system, useHookFormPersist }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    getValues,
    setError,
    control,
    watch,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const {
    persistedData: { line_points, width, length },
  } = useHookFormPersist(['/map'], getValues, setValue);
  const onError = (data) => {};
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      length,
      line_points,
      width,
      ...data,
      type: 'buffer_zone',
    };
    formData[bufferZoneEnum.width_unit] = formData[bufferZoneEnum.width_unit].value;
    submitForm({ formData });
  };

  return (
    <LineDetailsLayout
      name={t('FARM_MAP.BUFFER_ZONE.NAME')}
      title={t('FARM_MAP.BUFFER_ZONE.TITLE')}
      history={history}
      submitForm={onSubmit}
      onError={onError}
      register={register}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      getValues={getValues}
      setError={setError}
      control={control}
      errors={errors}
      system={system}
      width={width}
    >
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
            hookFormSetError={setError}
            hookFromWatch={watch}
            control={control}
            disabled
            defaultValue={width}
          />
        </div>
      </div>
    </LineDetailsLayout>
  );
}
