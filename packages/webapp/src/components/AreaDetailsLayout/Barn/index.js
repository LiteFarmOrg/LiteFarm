import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Radio from '../../Form/Radio';
import { barnEnum } from '../../../containers/constants';
import { Label } from '../../Typography';

export default function PureBarn({ history, submitForm, system, useHookFormPersist }) {
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
  const {
    persistedData: { grid_points, total_area, perimeter },
  } = useHookFormPersist(['/map'], getValues, setValue);

  const onError = (data) => {};
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const washPackSelection = data[barnEnum.wash_and_pack];
    const coldStorage = data[barnEnum.cold_storage];
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

  return (
    <AreaDetailsLayout
      name={t('FARM_MAP.BARN.NAME')}
      title={t('FARM_MAP.BARN.TITLE')}
      history={history}
      submitForm={onSubmit}
      onError={onError}
      register={register}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      getValues={getValues}
      watch={watch}
      setError={setError}
      control={control}
      showPerimeter={false}
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
            inputRef={register({ required: false })}
            name={barnEnum.wash_and_pack}
            value={true}
          />
          <Radio
            style={{ marginLeft: '40px' }}
            label={t('common:NO')}
            inputRef={register({ required: false })}
            name={barnEnum.wash_and_pack}
            value={false}
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
            inputRef={register({ required: false })}
            name={barnEnum.cold_storage}
            value={true}
          />
          <Radio
            style={{ marginLeft: '40px' }}
            label={t('common:NO')}
            inputRef={register({ required: false })}
            name={barnEnum.cold_storage}
            value={false}
          />
        </div>
      </div>
    </AreaDetailsLayout>
  );
}
