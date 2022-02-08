import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetails from '../index';
import { useForm } from 'react-hook-form';
import { Label } from '../../../Typography';
import { area_total_area, line_length, line_width, watercourse_width } from '../../../../util/convert-units/unit';
import Unit from '../../../Form/Unit';
import { watercourseEnum } from '../../../../containers/constants';
import LocationButtons from '../../LocationButtons';

import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RadioGroup from '../../../Form/RadioGroup';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';

export default function PureWatercourseWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureWatercourse {...props} />
    </PersistedFormWrapper>
  );
}
export function PureWatercourse({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  persistedFormData,
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
    setValue,
    getValues,
    setError,
    control,

    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: persistedFormData,
  });

  const { historyCancel } = useHookFormPersist?.(getValues) || {};

  const onError = (data) => {};
  const disabled = !isValid;
  const onSubmit = (data) => {
    const usedForIrrigation = data[watercourseEnum.used_for_irrigation];
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
      type: 'watercourse',
      used_for_irrigation: usedForIrrigation,
    });
    formData[watercourseEnum.length_unit] = formData[watercourseEnum.length_unit]?.value;
    formData[watercourseEnum.width_unit] = formData[watercourseEnum.width_unit]?.value;
    formData[watercourseEnum.buffer_width_unit] =
      formData[watercourseEnum.buffer_width_unit]?.value;
    formData[watercourseEnum.total_area_unit] = formData[watercourseEnum.total_area_unit]?.value;
    submitForm({ formData });
  };

  const title =
    (isCreateLocationPage && t('FARM_MAP.WATERCOURSE.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.WATERCOURSE.EDIT_TITLE')) ||
    (isViewLocationPage && persistedFormData.name);

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
        onCancel={historyCancel}
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
              errors={errors[watercourseEnum.length]}
              unitType={line_length}
              system={system}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
              hookFromWatch={watch}
              control={control}
              required
              disabled={isViewLocationPage}
            />
          </div>
          <div
            style={{
              flexDirection: 'row',
              display: 'inline-flex',
              paddingBottom: '40px',
              width: '100%',
              gap: '16px',
            }}
          >
            <Unit
              register={register}
              classes={{ container: { flexGrow: 1 } }}
              label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
              name={watercourseEnum.total_area}
              displayUnitName={watercourseEnum.total_area_unit}
              errors={errors[watercourseEnum.total_area]}
              unitType={area_total_area}
              system={system}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
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
              hookFromWatch={watch}
              control={control}
              disabled={!isEditLocationPage}
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
              hookFromWatch={watch}
              control={control}
              disabled={!isEditLocationPage}
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
              <RadioGroup
                row
                disabled={isViewLocationPage}
                name={watercourseEnum.used_for_irrigation}
                hookFormControl={control}
              />
            </div>
          </div>
        </div>
      </LineDetails>
    </Form>
  );
}
