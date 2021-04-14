import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../index';
import { useForm } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../../Form/Radio';
import Input from '../../../Form/Input';
import { gardenEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RouterTab from '../../../RouterTab';
import { getPersistPath } from '../../utils';

export default function PureGarden({
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
  const persistedPath = getPersistPath('garden', match, {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  });
  const {
    persistedData: { grid_points, total_area, perimeter },
  } = useHookFormPersist(persistedPath, getValues, setValue, !!isCreateLocationPage);

  const onError = (data) => {};
  const gardenTypeSelection = watch(gardenEnum.organic_status);
  const disabled = !isValid || !isDirty;
  const showPerimeter = true;
  const onSubmit = (data) => {
    data[gardenEnum.total_area_unit] = data[gardenEnum.total_area_unit].value;
    showPerimeter && (data[gardenEnum.perimeter_unit] = data[gardenEnum.perimeter_unit].value);
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,

      type: 'garden',
    };
    submitForm({ formData });
  };

  const title =
    (isCreateLocationPage && t('FARM_MAP.GARDEN.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.GARDEN.EDIT_TITLE')) ||
    (isViewLocationPage && getValues(gardenEnum.name));

  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/garden/${match.params.location_id}/edit`)}
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
            { label: t('FARM_MAP.TAB.CROPS'), path: `/garden/${match.params.location_id}/crops` },
            {
              label: t('FARM_MAP.TAB.DETAILS'),
              path: `/garden/${match.params.location_id}/details`,
            },
          ]}
        />
      )}

      <AreaDetails
        name={t('FARM_MAP.GARDEN.NAME')}
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
            <Label
              style={{
                paddingRight: '10px',
                fontSize: '16px',
                lineHeight: '20px',
                display: 'inline-block',
              }}
            >
              {t('FARM_MAP.GARDEN.GARDEN_TYPE')}
            </Label>
            <img src={Leaf} style={{ display: 'inline-block' }} />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '16px' }}
              label={t('FARM_MAP.GARDEN.NON_ORGANIC')}
              defaultChecked={true}
              inputRef={register({ required: true })}
              value={'Non-Organic'}
              name={gardenEnum.organic_status}
              disabled={isViewLocationPage}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '16px' }}
              label={t('FARM_MAP.GARDEN.ORGANIC')}
              inputRef={register({ required: true })}
              value={'Organic'}
              name={gardenEnum.organic_status}
              disabled={isViewLocationPage}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '16px' }}
              label={t('FARM_MAP.GARDEN.TRANSITIONING')}
              inputRef={register({ required: true })}
              value={'Transitional'}
              name={gardenEnum.organic_status}
            />
          </div>
          <div style={{ paddingBottom: '20px' }}>
            {gardenTypeSelection === 'Transitional' && (
              <Input
                type={'date'}
                name={gardenEnum.transition_date}
                defaultValue={new Date().toLocaleDateString('en-CA')}
                label={t('FARM_MAP.GARDEN.DATE')}
                inputRef={register({ required: true })}
                style={{ paddingTop: '16px', paddingBottom: '20px' }}
                disabled={isViewLocationPage}
              />
            )}
          </div>
        </div>
      </AreaDetails>
    </Form>
  );
}
