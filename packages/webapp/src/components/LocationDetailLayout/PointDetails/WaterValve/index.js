import React from 'react';
import { useTranslation } from 'react-i18next';
import PointDetails from '../index';
import { useForm } from 'react-hook-form';
import Unit from '../../../Form/Unit';
import { waterValveEnum } from '../../../../containers/constants';
import { water_valve_flow_rate } from '../../../../util/unit';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';

import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import RadioGroup from '../../../Form/RadioGroup';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';

export default function PureWaterValveWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureWaterValve {...props} />
    </PersistedFormWrapper>
  );
}
export function PureWaterValve({
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
    handleSubmit,
    setValue,
    register,
    watch,
    getValues,
    setError,
    control,

    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: { [waterValveEnum.source]: 'Municipal water', ...persistedFormData },
  });

  const { historyCancel } = useHookFormPersist?.(getValues) || {};

  const onError = (data) => {};
  const disabled = !isValid;

  const onSubmit = (data) => {
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
    });
    formData[waterValveEnum.flow_rate_unit] = formData[waterValveEnum.flow_rate_unit]?.value;
    submitForm({ formData });
  };
  const title =
    (isCreateLocationPage && t('FARM_MAP.WATER_VALVE.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.WATER_VALVE.EDIT_TITLE')) ||
    (isViewLocationPage && persistedFormData.name);

  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/water_valve/${match.params.location_id}/edit`)}
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
          <Label style={{ marginBottom: '25px' }}>
            {t('FARM_MAP.WATER_VALVE.WATER_VALVE_TYPE')}
          </Label>

          <RadioGroup
            disabled={isViewLocationPage}
            hookFormControl={control}
            style={{ marginBottom: '14px' }}
            name={waterValveEnum.source}
            radios={[
              {
                label: t('FARM_MAP.WATER_VALVE.MUNICIPAL_WATER'),
                value: 'Municipal water',
              },
              {
                label: t('FARM_MAP.WATER_VALVE.SURFACE_WATER'),
                value: 'Surface water',
              },
              {
                label: t('FARM_MAP.WATER_VALVE.GROUNDWATER'),
                value: 'Groundwater',
              },
              {
                label: t('FARM_MAP.WATER_VALVE.RAIN_WATER'),
                value: 'Rain water',
              },
            ]}
          />

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
            hookFromWatch={watch}
            control={control}
            optional
            disabled={isViewLocationPage}
          />
        </div>
      </PointDetails>
    </Form>
  );
}
