import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Radio from '../../Form/Radio';
import { surfaceWaterEnum } from '../../../containers/surfaceWaterSlice';
import { Label } from '../../Typography';

export default function PureSurfaceWater({ history, submitForm, system, grid_points }) {
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
  const onError = (data) => {};
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      ...data,
      grid_points: grid_points,
      type: 'surface_water',
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
      isNameRequired={true}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      getValues={getValues}
      setError={setError}
      control={control}
      showPerimeter={false}
      errors={errors}
      system={system}
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
            // value={'Non-Organic'}
            // name={gardenEnum.organic_status}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('common:NO')}
            inputRef={register({ required: false })}
            // value={'Organic'}
            // name={gardenEnum.organic_status}
          />
        </div>
      </div>
    </AreaDetailsLayout>
  );
}
