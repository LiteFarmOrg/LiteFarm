import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../index';
import { useForm } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../../Form/Radio';
import Input from '../../../Form/Input';
import { greenhouseEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RouterTab from '../../../RouterTab';
import { getDateInputFormat, getPersistPath } from '../../utils';

export default function PureGreenhouse({
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
    setValue,
    getValues,
    setError,
    control,

    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
  });
  const persistedPath = getPersistPath('greenhouse', match, {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  });
  const {
    persistedData: { name, grid_points, total_area, perimeter },
  } = useHookFormPersist(persistedPath, getValues, setValue, !!isCreateLocationPage);

  const onError = (data) => {};

  const greenhouseTypeSelection = watch(greenhouseEnum.organic_status);
  const supplementalLighting = watch(greenhouseEnum.supplemental_lighting);
  const co2Enrichment = watch(greenhouseEnum.co2_enrichment);
  const greenhouseHeated = watch(greenhouseEnum.greenhouse_heated);

  const disabled = !isValid || !isDirty;
  console.log(isValid, isDirty, errors);
  const showPerimeter = false;
  const onSubmit = (data) => {
    data[greenhouseEnum.total_area_unit] = data[greenhouseEnum.total_area_unit]?.value;
    data[greenhouseEnum.perimeter_unit] = data[greenhouseEnum.perimeter_unit]?.value;
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,

      type: 'greenhouse',
      supplemental_lighting:
        supplementalLighting !== null && supplementalLighting !== undefined
          ? supplementalLighting === 'true'
          : null,
      co2_enrichment:
        co2Enrichment !== null && co2Enrichment !== undefined ? co2Enrichment === 'true' : null,
      greenhouse_heated:
        greenhouseHeated !== null && greenhouseHeated !== undefined
          ? greenhouseHeated === 'true'
          : null,
    };
    submitForm({ formData });
  };
  const title =
    (isCreateLocationPage && t('FARM_MAP.GREENHOUSE.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.GREENHOUSE.EDIT_TITLE')) ||
    (isViewLocationPage && name);
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
        total_area={total_area}
        perimeter={perimeter}
      >
        <div>
          <div style={{ marginBottom: '20px' }}>
            <Label style={{ paddingRight: '10px', display: 'inline-block', fontSize: '16px' }}>
              {t('FARM_MAP.GREENHOUSE.GREENHOUSE_TYPE')}
            </Label>
            <img src={Leaf} style={{ display: 'inline-block' }} />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '16px' }}
              label={t('FARM_MAP.GREENHOUSE.NON_ORGANIC')}
              defaultChecked={true}
              hookFormRegister={register(greenhouseEnum.organic_status, { required: true })}
              value={'Non-Organic'}
              disabled={isViewLocationPage}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '16px' }}
              label={t('FARM_MAP.GREENHOUSE.ORGANIC')}
              hookFormRegister={register(greenhouseEnum.organic_status, { required: true })}
              value={'Organic'}
              disabled={isViewLocationPage}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '16px' }}
              label={t('FARM_MAP.GREENHOUSE.TRANSITIONING')}
              hookFormRegister={register(greenhouseEnum.organic_status, { required: true })}
              value={'Transitional'}
              disabled={isViewLocationPage}
            />
          </div>
          <div style={{ paddingBottom: greenhouseTypeSelection === 'Organic' ? '9px' : '20px' }}>
            {greenhouseTypeSelection === 'Transitional' && (
              <Input
                type={'date'}
                defaultValue={getDateInputFormat(new Date())}
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
                <div>
                  <Radio
                    label={t('common:YES')}
                    hookFormRegister={register(greenhouseEnum.supplemental_lighting, {
                      required: false,
                    })}
                    value={true}
                    disabled={isViewLocationPage}
                  />
                  <Radio
                    style={{ marginLeft: '40px' }}
                    label={t('common:NO')}
                    hookFormRegister={register(greenhouseEnum.supplemental_lighting, {
                      required: false,
                    })}
                    value={false}
                    disabled={isViewLocationPage}
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
                <div>
                  <Radio
                    label={t('common:YES')}
                    hookFormRegister={register(greenhouseEnum.co2_enrichment, { required: false })}
                    value={true}
                    disabled={isViewLocationPage}
                  />
                  <Radio
                    style={{ marginLeft: '40px' }}
                    label={t('common:NO')}
                    hookFormRegister={register(greenhouseEnum.co2_enrichment, { required: false })}
                    value={false}
                    disabled={isViewLocationPage}
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
                  <Radio
                    label={t('common:YES')}
                    hookFormRegister={register(greenhouseEnum.greenhouse_heated, {
                      required: false,
                    })}
                    value={true}
                    disabled={isViewLocationPage}
                  />
                  <Radio
                    style={{ marginLeft: '40px' }}
                    label={t('common:NO')}
                    hookFormRegister={register(greenhouseEnum.greenhouse_heated, {
                      required: false,
                    })}
                    value={false}
                    disabled={isViewLocationPage}
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
