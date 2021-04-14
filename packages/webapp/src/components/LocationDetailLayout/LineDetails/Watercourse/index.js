import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetails from '../index';
import { useForm } from 'react-hook-form';
import Radio from '../../../Form/Radio';
import { Label } from '../../../Typography';
import { line_length, line_width, watercourse_width } from '../../../../util/unit';
import Unit from '../../../Form/Unit';
import { bufferZoneEnum, watercourseEnum } from '../../../../containers/constants';
import LocationButtons from '../../LocationButtons';
import { getPersistPath } from '../../utils';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';

export default function PureWatercourse({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  useHookFormPersist,
  handleRetire,
  isAdmin,
}) {
  const { t } = useTranslation();
  const unit = system === 'metric' ? 'm' : 'ft';
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
  const persistedPath = getPersistPath('watercourse', match, {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  });
  const {
    persistedData: {
      line_points,
      length,
      width,

      buffer_width,
    },
  } = useHookFormPersist(persistedPath, getValues, setValue, !!isCreateLocationPage);

  const onError = (data) => {};
  const usedForIrrigation = watch(watercourseEnum.used_for_irrigation);
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    data[watercourseEnum.length_unit] = data[watercourseEnum.length_unit].value;
    const formData = {
      line_points,
      length,
      width,
      buffer_width,
      ...data,
      type: 'watercourse',
      used_for_irrigation: usedForIrrigation !== null ? usedForIrrigation === 'true' : null,
    };
    formData[watercourseEnum.length_unit] = formData[watercourseEnum.length_unit].value;
    formData[watercourseEnum.width_unit] = formData[watercourseEnum.width_unit].value;
    formData[watercourseEnum.buffer_width_unit] = formData[watercourseEnum.buffer_width_unit].value;
    submitForm({ formData });
  };

  const title =
    (isCreateLocationPage && t('FARM_MAP.WATERCOURSE.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.WATERCOURSE.EDIT_TITLE')) ||
    (isViewLocationPage && getValues(bufferZoneEnum.name));

  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/watercourse/${match.params.location_id}/edit`)}
          onRetire={handleRetire}
          isAdmin={isAdmin}
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
      <LineDetails
        name={t('FARM_MAP.WATERCOURSE.NAME')}
        history={history}
        isCreateLocationPage={isCreateLocationPage}
        isViewLocationPage={isViewLocationPage}
        isEditLocationPage={isEditLocationPage}
        register={register}
        disabled={disabled}
        handleSubmit={handleSubmit}
        setValue={setValue}
        getValues={getValues}
        setError={setError}
        control={control}
        errors={errors}
        system={system}
      >
        <div>
          <div>
            <Unit
              style={{ marginBottom: '40px', zIndex: 2 }}
              register={register}
              classes={{ container: { flexGrow: 1 } }}
              label={t('FARM_MAP.WATERCOURSE.LENGTH')}
              name={watercourseEnum.length}
              displayUnitName={watercourseEnum.length_unit}
              defaultValue={length}
              errors={errors[watercourseEnum.length]}
              unitType={line_length}
              system={system}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
              hookFormSetError={setError}
              hookFromWatch={watch}
              control={control}
              required
              disabled={isViewLocationPage}
            />
          </div>
          <div>
            <Unit
              register={register}
              classes={{ container: { flexGrow: 1, marginBottom: '40px' } }}
              label={t('FARM_MAP.WATERCOURSE.WIDTH')}
              name={watercourseEnum.width}
              displayUnitName={watercourseEnum.width_unit}
              errors={errors[watercourseEnum.width]}
              unitType={line_width}
              system={system}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
              hookFormSetError={setError}
              hookFromWatch={watch}
              control={control}
              disabled={!isEditLocationPage}
              defaultValue={width}
            />
          </div>
          <div>
            <Unit
              register={register}
              classes={{ container: { flexGrow: 1, marginBottom: '40px' } }}
              label={t('FARM_MAP.WATERCOURSE.BUFFER')}
              name={watercourseEnum.buffer_width}
              displayUnitName={watercourseEnum.buffer_width_unit}
              errors={errors[watercourseEnum.buffer_width]}
              unitType={watercourse_width}
              system={system}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
              hookFormSetError={setError}
              hookFromWatch={watch}
              control={control}
              disabled={!isEditLocationPage}
              defaultValue={buffer_width}
            />
          </div>
          <div>
            <div style={{ marginBottom: '20px' }}>
              <Label style={{ paddingRight: '10px', display: 'inline-block', fontSize: '16px' }}>
                {t('FARM_MAP.WATERCOURSE.IRRIGATION')}
              </Label>
              <Label style={{ display: 'inline-block' }} sm>
                {t('common:OPTIONAL')}
              </Label>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Radio
                label={t('common:YES')}
                inputRef={register({ required: false })}
                value={true}
                name={watercourseEnum.used_for_irrigation}
                disabled={isViewLocationPage}
              />
              <Radio
                style={{ marginLeft: '40px' }}
                label={t('common:NO')}
                inputRef={register({ required: false })}
                value={false}
                name={watercourseEnum.used_for_irrigation}
                disabled={isViewLocationPage}
              />
            </div>
          </div>
        </div>
      </LineDetails>
    </Form>
  );
}
