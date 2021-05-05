import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetails from '../index';
import { useForm } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../../Form/Radio';
import { bufferZoneEnum, fenceEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import { line_length } from '../../../../util/unit';
import Unit from '../../../Form/Unit';
import LocationButtons from '../../LocationButtons';
import { getPersistPath } from '../../utils';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';

export default function PureFence({
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
  const persistedPath = getPersistPath('fence', match, {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  });
  const {
    persistedData: { line_points, length },
  } = useHookFormPersist(persistedPath, getValues, setValue, !!isCreateLocationPage);

  const onError = (data) => {};
  const isPressureTreated = watch(fenceEnum.pressure_treated);
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    data[fenceEnum.length_unit] = data[fenceEnum.length_unit].value;
    data[fenceEnum.width] = 0;
    const formData = {
      ...data,
      line_points: line_points,
      pressure_treated: isPressureTreated !== null ? isPressureTreated === 'true' : null,
      type: 'fence',
    };
    submitForm({ formData });
  };

  const title =
    (isCreateLocationPage && t('FARM_MAP.FENCE.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.FENCE.EDIT_TITLE')) ||
    (isViewLocationPage && getValues(bufferZoneEnum.name));

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
              defaultValue={length}
              errors={errors[fenceEnum.length]}
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
              <Radio
                label={t('common:YES')}
                inputRef={register({ required: false })}
                value={true}
                name={fenceEnum.pressure_treated}
                disabled={isViewLocationPage}
              />
              <Radio
                style={{ marginLeft: '40px' }}
                label={t('common:NO')}
                inputRef={register({ required: false })}
                value={false}
                name={fenceEnum.pressure_treated}
                disabled={isViewLocationPage}
              />
            </div>
          </div>
        </div>
      </LineDetails>
    </Form>
  );
}
