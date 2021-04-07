import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../index';
import { useForm } from 'react-hook-form';
import Radio from '../../../Form/Radio';
import { surfaceWaterEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../../ButtonGroup/LocationButtons';

export default function PureSurfaceWater({
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
  const showPerimeter = false;
  const onSubmit = (data) => {
    data[surfaceWaterEnum.total_area_unit] = data[surfaceWaterEnum.total_area_unit].value;
    showPerimeter &&
      (data[surfaceWaterEnum.perimeter_unit] = data[surfaceWaterEnum.perimeter_unit].value);
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
    <AreaDetails
      name={t('FARM_MAP.SURFACE_WATER.NAME')}
      title={t('FARM_MAP.SURFACE_WATER.TITLE')}
      history={history}
      isCreateLocationPage={isCreateLocationPage}
      isViewLocationPage={isViewLocationPage}
      isEditLocationPage={isEditLocationPage}
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
      buttonGroup={<LocationButtons disabled={disabled} />}
    >
      <div>
        <div style={{ marginBottom: '20px' }}>
          <Label style={{ paddingRight: '10px', display: 'inline-block' }}>
            {t('FARM_MAP.SURFACE_WATER.IRRIGATION')}
          </Label>
          <Label style={{ display: 'inline-block' }} sm>
            {t('common:OPTIONAL')}
          </Label>
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('common:YES')}
            inputRef={register({ required: false })}
            optional
            value={true}
            name={surfaceWaterEnum.used_for_irrigation}
            disabled={isViewLocationPage}
          />
          <Radio
            style={{ marginBottom: '25px', marginLeft: '40px' }}
            label={t('common:NO')}
            inputRef={register({ required: false })}
            value={false}
            name={surfaceWaterEnum.used_for_irrigation}
            disabled={isViewLocationPage}
          />
        </div>
      </div>
    </AreaDetails>
  );
}
