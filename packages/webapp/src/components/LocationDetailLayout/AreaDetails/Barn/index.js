import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../index';
import { useForm } from 'react-hook-form';
import Radio from '../../../Form/Radio';
import { barnEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import { getPersistPath } from '../../utils';

export default function PureBarn({
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
    shouldUnregister: true,
  });
  const persistedPath = getPersistPath('barn', match, {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  });
  const {
    persistedData: { name, grid_points, total_area, perimeter },
  } = useHookFormPersist(getValues, persistedPath, setValue, !!isCreateLocationPage);

  const onError = (data) => {};
  const disabled = !isValid || !isDirty;
  const showPerimeter = false;
  const onSubmit = (data) => {
    const washPackSelection = data[barnEnum.wash_and_pack];
    const coldStorage = data[barnEnum.cold_storage];
    data[barnEnum.total_area_unit] = data[barnEnum.total_area_unit]?.value;
    data[barnEnum.perimeter_unit] = data[barnEnum.perimeter_unit]?.value;
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,
      type: 'barn',
      wash_and_pack: washPackSelection !== null ? washPackSelection === 'true' : null,
      cold_storage: coldStorage !== null ? coldStorage === 'true' : null,
    };
    submitForm({ formData });
  };

  const title =
    (isCreateLocationPage && t('FARM_MAP.BARN.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.BARN.EDIT_TITLE')) ||
    (isViewLocationPage && name);

  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/barn/${match.params.location_id}/edit`)}
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
      <AreaDetails
        name={t('FARM_MAP.BARN.NAME')}
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
              {t('FARM_MAP.BARN.WASH_PACK')}
            </Label>
            <Label style={{ display: 'inline-block' }} sm>
              {t('common:OPTIONAL')}
            </Label>
          </div>
          <div>
            <Radio
              label={t('common:YES')}
              hookFormRegister={register(barnEnum.wash_and_pack, { required: false })}
              value={true}
              disabled={isViewLocationPage}
            />
            <Radio
              style={{ marginLeft: '40px' }}
              label={t('common:NO')}
              hookFormRegister={register(barnEnum.wash_and_pack, { required: false })}
              value={false}
              disabled={isViewLocationPage}
            />
          </div>
        </div>
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
              {t('FARM_MAP.BARN.COLD_STORAGE')}
            </Label>
            <Label style={{ display: 'inline-block' }} sm>
              {t('common:OPTIONAL')}
            </Label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Radio
              label={t('common:YES')}
              hookFormRegister={register(barnEnum.cold_storage, { required: false })}
              value={true}
              disabled={isViewLocationPage}
            />
            <Radio
              style={{ marginLeft: '40px' }}
              label={t('common:NO')}
              hookFormRegister={register(barnEnum.cold_storage, { required: false })}
              value={false}
              disabled={isViewLocationPage}
            />
          </div>
        </div>
      </AreaDetails>
    </Form>
  );
}
