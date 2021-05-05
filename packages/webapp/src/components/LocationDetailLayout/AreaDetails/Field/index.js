import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../index';
import { useForm } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../../Form/Radio';
import Input from '../../../Form/Input';
import { fieldEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RouterTab from '../../../RouterTab';
import { getDateInputFormat, getPersistPath } from '../../utils';

export default function PureField({
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
  const persistedPath = getPersistPath('field', match, {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  });
  const {
    persistedData: { grid_points, total_area, perimeter },
  } = useHookFormPersist(persistedPath, getValues, setValue, !!isCreateLocationPage);

  const onError = (data) => {};
  const fieldTypeSelection = watch(fieldEnum.organic_status);
  const disabled = !isValid || !isDirty;
  const showPerimeter = true;
  const onSubmit = (data) => {
    data[fieldEnum.total_area_unit] = data[fieldEnum.total_area_unit].value;
    showPerimeter && (data[fieldEnum.perimeter_unit] = data[fieldEnum.perimeter_unit].value);
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,

      type: 'field',
    };
    submitForm({ formData });
  };

  const title =
    (isCreateLocationPage && t('FARM_MAP.FIELD.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.FIELD.EDIT_TITLE')) ||
    (isViewLocationPage && getValues(fieldEnum.name));

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
        total_area={total_area}
        perimeter={perimeter}
      >
        <div>
          <div style={{ marginBottom: '20px' }}>
            <Label style={{ paddingRight: '10px', display: 'inline-block', fontSize: '16px' }}>
              {t('FARM_MAP.FIELD.FIELD_TYPE')}
            </Label>
            <img src={Leaf} style={{ display: 'inline-block' }} />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '16px' }}
              label={t('FARM_MAP.FIELD.NON_ORGANIC')}
              defaultChecked={true}
              inputRef={register({ required: true })}
              value={'Non-Organic'}
              name={fieldEnum.organic_status}
              disabled={isViewLocationPage}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '16px' }}
              label={t('FARM_MAP.FIELD.ORGANIC')}
              inputRef={register({ required: true })}
              value={'Organic'}
              name={fieldEnum.organic_status}
              disabled={isViewLocationPage}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '16px' }}
              label={t('FARM_MAP.FIELD.TRANSITIONING')}
              inputRef={register({ required: true })}
              value={'Transitional'}
              name={fieldEnum.organic_status}
              disabled={isViewLocationPage}
            />
          </div>
          <div style={{ paddingBottom: '20px' }}>
            {fieldTypeSelection === 'Transitional' && (
              <Input
                style={{ paddingBottom: '16px' }}
                type={'date'}
                name={fieldEnum.transition_date}
                defaultValue={getDateInputFormat(new Date())}
                label={t('FARM_MAP.FIELD.DATE')}
                hookFormRegister={register({ required: true })}
                disabled={isViewLocationPage}
              />
            )}
          </div>
        </div>
      </AreaDetails>
    </Form>
  );
}
