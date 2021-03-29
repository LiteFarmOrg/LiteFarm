import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Radio from '../../Form/Radio';
import { surfaceWaterEnum } from '../../../containers/constants';
import { Label } from '../../Typography';

export default function PureSurfaceWater({ history, submitForm, system, useHookFormPersist }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    getValues,
    setError,
    control,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const {
    persistedData: { grid_points, total_area, perimeter },
  } = useHookFormPersist(['/map'], getValues, setValue);
  const onError = (data) => {};
  const irrigation = watch(surfaceWaterEnum.used_for_irrigation);
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,

      type: 'surface_water',
      used_for_irrigation: irrigation !== null ? irrigation === 'true' : null,
    };
    submitForm({ formData });
  };

  return (
    <AreaDetailsLayout
      name={t('FARM_MAP.SURFACE_WATER.NAME')}
      title={t('FARM_MAP.SURFACE_WATER.TITLE')}
      history={history}
      submitForm={onSubmit}
      onError={onError}
      register={register}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      getValues={getValues}
      watch={watch}
      setError={setError}
      control={control}
      showPerimeter={true}
      errors={errors}
      system={system}
      total_area={total_area}
      perimeter={perimeter}
    >
      <div>
        <p style={{ marginBottom: '25px' }}>
          {t('FARM_MAP.SURFACE_WATER.IRRIGATION')}
          <Label style={{ paddingLeft: '10px' }} sm>
            ({t('common:OPTIONAL')})
          </Label>
        </p>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('common:YES')}
            inputRef={register({ required: false })}
            optional
            value={true}
            name={surfaceWaterEnum.used_for_irrigation}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('common:NO')}
            inputRef={register({ required: false })}
            value={false}
            name={surfaceWaterEnum.used_for_irrigation}
          />
        </div>
      </div>
    </AreaDetailsLayout>
  );
}
