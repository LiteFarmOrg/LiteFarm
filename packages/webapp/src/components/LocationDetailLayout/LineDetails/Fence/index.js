import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetails from '../index';
import { useForm } from 'react-hook-form';
import Leaf from '../../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../../Form/Radio';
import { fenceEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import { line_length } from '../../../../util/unit';
import Unit from '../../../Form/Unit';
import LocationButtons from '../../LocationButtons';
import { getPersistPath } from '../../utils';

export default function PureFence({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  useHookFormPersist,
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

  return (
    <LineDetails
      name={t('FARM_MAP.FENCE.NAME')}
      title={t('FARM_MAP.FENCE.TITLE')}
      history={history}
      isCreateLocationPage={isCreateLocationPage}
      isViewLocationPage={isViewLocationPage}
      isEditLocationPage={isEditLocationPage}
      submitForm={onSubmit}
      onError={onError}
      register={register}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      getValues={getValues}
      setError={setError}
      control={control}
      errors={errors}
      system={system}
      buttonGroup={<LocationButtons disabled={disabled} />}
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
  );
}
