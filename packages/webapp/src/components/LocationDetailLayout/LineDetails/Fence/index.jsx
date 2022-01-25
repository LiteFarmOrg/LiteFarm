import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetails from '../index';
import { useForm } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import { bufferZoneEnum, fenceEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import { line_length } from '../../../../util/unit';
import Unit from '../../../Form/Unit';
import LocationButtons from '../../LocationButtons';

import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RadioGroup from '../../../Form/RadioGroup';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';

export default function PureFenceWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureFence {...props} />
    </PersistedFormWrapper>
  );
}
export function PureFence({
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
    const isPressureTreated = data[fenceEnum.pressure_treated];
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
      pressure_treated: isPressureTreated,
      type: 'fence',
    });
    formData[fenceEnum.width] = 0;
    formData[fenceEnum.width_unit] = formData[fenceEnum.width_unit]?.value;
    formData[fenceEnum.length_unit] = formData[fenceEnum.length_unit]?.value;
    delete formData[bufferZoneEnum.total_area_unit];
    submitForm({ formData });
  };

  const title =
    (isCreateLocationPage && t('FARM_MAP.FENCE.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.FENCE.EDIT_TITLE')) ||
    (isViewLocationPage && persistedFormData.name);

  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/fence/${match.params.location_id}/edit`)}
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
        name={t('FARM_MAP.FENCE.NAME')}
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
              style={{ marginBottom: '40px' }}
              register={register}
              classes={{ container: { flexGrow: 1 } }}
              label={t('FARM_MAP.FENCE.LENGTH')}
              name={fenceEnum.length}
              displayUnitName={fenceEnum.length_unit}
              errors={errors[fenceEnum.length]}
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
          <div>
            <div style={{ marginBottom: '20px' }}>
              <Label style={{ paddingRight: '7px', display: 'inline-block', fontSize: '16px' }}>
                {t('FARM_MAP.FENCE.PRESSURE_TREATED')}
              </Label>
              <img src={Leaf} style={{ display: 'inline-block', paddingRight: '10px' }} />
              <Label style={{ display: 'inline-block' }} sm>
                {t('common:OPTIONAL')}
              </Label>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <RadioGroup
                row
                disabled={isViewLocationPage}
                name={fenceEnum.pressure_treated}
                hookFormControl={control}
              />
            </div>
          </div>
        </div>
      </LineDetails>
    </Form>
  );
}
