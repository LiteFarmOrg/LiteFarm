import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../AreaDetails';
import { useForm } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Input from '../../../Form/Input';
import { greenhouseEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RouterTab from '../../../RouterTab';

import { getDateInputFormat } from '../../../../util/moment';
import RadioGroup from '../../../Form/RadioGroup';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';

export default function PureGreenhouseWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureGreenhouse {...props} />
    </PersistedFormWrapper>
  );
}

export function PureGreenhouse({
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
  const getDefaultValues = () => {
    return {
      [greenhouseEnum.organic_status]: 'Non-Organic',
      ...persistedFormData,
      [greenhouseEnum.transition_date]: getDateInputFormat(
        persistedFormData[greenhouseEnum.transition_date] || new Date(),
      ),
    };
  };
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
    defaultValues: getDefaultValues(),
  });

  const { historyCancel } = useHookFormPersist?.(getValues) || {};

  const onError = (data) => {};

  const greenhouseTypeSelection = watch(greenhouseEnum.organic_status);

  const disabled = !isValid;
  console.log(isValid, isDirty, errors);
  const showPerimeter = false;
  const onSubmit = (data) => {
    const supplementalLighting = data[greenhouseEnum.supplemental_lighting];
    const co2Enrichment = data[greenhouseEnum.co2_enrichment];
    const greenhouseHeated = data[greenhouseEnum.greenhouse_heated];
    data[greenhouseEnum.total_area_unit] = data[greenhouseEnum.total_area_unit]?.value;
    data[greenhouseEnum.perimeter_unit] = data[greenhouseEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,

      type: 'greenhouse',
      supplemental_lighting: supplementalLighting,
      co2_enrichment: co2Enrichment,
      greenhouse_heated: greenhouseHeated,
    });
    submitForm({ formData });
  };
  const title =
    (isCreateLocationPage && t('FARM_MAP.GREENHOUSE.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.GREENHOUSE.EDIT_TITLE')) ||
    (isViewLocationPage && persistedFormData.name);
  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/greenhouse/${match.params.location_id}/edit`)}
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
      {isViewLocationPage && (
        <RouterTab
          classes={{ container: { margin: '6px 0 26px 0' } }}
          history={history}
          match={match}
          tabs={[
            {
              label: t('FARM_MAP.TAB.CROPS'),
              path: `/greenhouse/${match.params.location_id}/crops`,
            },
            {
              label: t('FARM_MAP.TAB.DETAILS'),
              path: `/greenhouse/${match.params.location_id}/details`,
            },
          ]}
        />
      )}

      <AreaDetails
        name={t('FARM_MAP.GREENHOUSE.NAME')}
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
      >
        <div>
          <div style={{ marginBottom: '20px' }}>
            <Label style={{ paddingRight: '10px', display: 'inline-block', fontSize: '16px' }}>
              {t('FARM_MAP.GREENHOUSE.GREENHOUSE_TYPE')}
            </Label>
            <img src={Leaf} style={{ display: 'inline-block' }} />
          </div>
          <RadioGroup
            required={true}
            disabled={isViewLocationPage}
            hookFormControl={control}
            name={greenhouseEnum.organic_status}
            radios={[
              {
                label: t('FARM_MAP.GREENHOUSE.NON_ORGANIC'),
                value: 'Non-Organic',
              },
              {
                label: t('FARM_MAP.GREENHOUSE.ORGANIC'),
                value: 'Organic',
              },
              {
                label: t('FARM_MAP.GREENHOUSE.TRANSITIONING'),
                value: 'Transitional',
              },
            ]}
          />

          <div style={{ paddingBottom: greenhouseTypeSelection === 'Organic' ? '9px' : '20px' }}>
            {greenhouseTypeSelection === 'Transitional' && (
              <Input
                type={'date'}
                label={t('FARM_MAP.GREENHOUSE.DATE')}
                hookFormRegister={register(greenhouseEnum.transition_date, { required: true })}
                style={{ paddingTop: '16px', paddingBottom: '20px' }}
                disabled={isViewLocationPage}
              />
            )}
          </div>
          <div>
            {greenhouseTypeSelection === 'Organic' && (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <Label style={{ paddingRight: '7px', display: 'inline-block', fontSize: '16px' }}>
                    {t('FARM_MAP.GREENHOUSE.SUPPLEMENTAL_LIGHTING')}
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
                    name={greenhouseEnum.supplemental_lighting}
                    hookFormControl={control}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <Label style={{ paddingRight: '7px', display: 'inline-block', fontSize: '16px' }}>
                    {t('FARM_MAP.GREENHOUSE.CO2_ENRICHMENT')}
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
                    name={greenhouseEnum.co2_enrichment}
                    hookFormControl={control}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <Label style={{ paddingRight: '7px', display: 'inline-block', fontSize: '16px' }}>
                    {t('FARM_MAP.GREENHOUSE.GREENHOUSE_HEATED')}
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
                    name={greenhouseEnum.greenhouse_heated}
                    hookFormControl={control}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </AreaDetails>
    </Form>
  );
}
