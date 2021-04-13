import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../index';
import { useForm } from 'react-hook-form';
import Radio from '../../../Form/Radio';
import { surfaceWaterEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import { getPersistPath } from '../../utils';

export default function PureSurfaceWater({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  useHookFormPersist,
  handleRetire,
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
  const persistedPath = getPersistPath('surface_water', match, {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  });
  const {
    persistedData: { grid_points, total_area, perimeter },
  } = useHookFormPersist(persistedPath, getValues, setValue, !!isCreateLocationPage);

  const onError = (data) => {};
  const irrigation = watch(surfaceWaterEnum.used_for_irrigation);
  const disabled = !isValid || !isDirty;
  const showPerimeter = true;
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

  const title =
    (isCreateLocationPage && t('FARM_MAP.SURFACE_WATER.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.SURFACE_WATER.EDIT_TITLE')) ||
    (isViewLocationPage && getValues(surfaceWaterEnum.name));

  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/surface_water/${match.params.location_id}/edit`)}
          onRetire={handleRetire}
        />
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <LocationPageHeader
        title={title}
        isCreateLocationPage={isCreateLocationPage}
        isViewLocationPage={isViewLocationPage}
        isEditLocationPage={isEditLocationPage}
        history={history}
        match={match}
      />
      <AreaDetails
        name={t('FARM_MAP.SURFACE_WATER.NAME')}
        history={history}
        isCreateLocationPage={isCreateLocationPage}
        isViewLocationPage={isViewLocationPage}
        isEditLocationPage={isEditLocationPage}
        register={register}
        setValue={setValue}
        getValues={getValues}
        watch={watch}
        setError={setError}
        control={control}
        showPerimeter={showPerimeter}
        errors={errors}
        system={system}
        total_area={total_area}
        perimeter={perimeter}
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
    </Form>
  );
}
