import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../AreaDetails';
import { useForm } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Input from '../../../Form/Input';
import { fieldEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RouterTab from '../../../RouterTab';

import { getDateInputFormat } from '../../../../util/moment';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import RadioGroup from '../../../Form/RadioGroup';
import {
  getFormDataWithoutNulls,
  getProcessedFormData,
} from '../../../../containers/hooks/useHookFormPersist/utils';

export default function PureFieldWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureField {...props} />
    </PersistedFormWrapper>
  );
}

export function PureField({
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
  getProcessedFormData();
  const { t } = useTranslation();
  const getDefaultValues = () => {
    return {
      [fieldEnum.organic_status]: 'Non-Organic',
      ...persistedFormData,
      [fieldEnum.transition_date]: getDateInputFormat(
        persistedFormData[fieldEnum.transition_date] || new Date(),
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
  const fieldTypeSelection = watch(fieldEnum.organic_status);
  const disabled = !isValid;
  const showPerimeter = true;
  const onSubmit = (data) => {
    data[fieldEnum.total_area_unit] = data[fieldEnum.total_area_unit]?.value;
    data[fieldEnum.perimeter_unit] = data[fieldEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,

      type: 'field',
    });
    submitForm({ formData });
  };

  const title =
    (isCreateLocationPage && t('FARM_MAP.FIELD.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.FIELD.EDIT_TITLE')) ||
    (isViewLocationPage && persistedFormData.name);

  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/field/${match.params.location_id}/edit`)}
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
              path: `/field/${match.params.location_id}/crops`,
            },
            {
              label: t('FARM_MAP.TAB.DETAILS'),
              path: `/field/${match.params.location_id}/details`,
            },
          ]}
        />
      )}
      <AreaDetails
        name={t('FARM_MAP.FIELD.NAME')}
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
              {t('FARM_MAP.FIELD.FIELD_TYPE')}
            </Label>
            <img src={Leaf} style={{ display: 'inline-block' }} />
          </div>

          <RadioGroup
            required={true}
            disabled={isViewLocationPage}
            hookFormControl={control}
            name={fieldEnum.organic_status}
            radios={[
              {
                label: t('FARM_MAP.FIELD.NON_ORGANIC'),
                value: 'Non-Organic',
              },
              {
                label: t('FARM_MAP.FIELD.ORGANIC'),
                value: 'Organic',
              },
              {
                label: t('FARM_MAP.FIELD.TRANSITIONING'),
                value: 'Transitional',
              },
            ]}
          />

          <div style={{ paddingBottom: '20px' }}>
            {fieldTypeSelection === 'Transitional' && (
              <Input
                style={{ paddingBottom: '16px' }}
                type={'date'}
                label={t('FARM_MAP.FIELD.DATE')}
                hookFormRegister={register(fieldEnum.transition_date, { required: true })}
                disabled={isViewLocationPage}
              />
            )}
          </div>
        </div>
      </AreaDetails>
    </Form>
  );
}
