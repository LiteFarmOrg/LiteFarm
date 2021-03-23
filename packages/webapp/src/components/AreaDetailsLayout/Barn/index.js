import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import Radio from '../../Form/Radio';
import { barnEnum } from '../../../containers/barnSlice';
import { Label } from '../../Typography';

export default function PureBarn({ history, submitForm, system, grid_points }) {
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
  const washPackSelection = watch(barnEnum.wash_and_pack);
  const coldStorage = watch(barnEnum.cold_storage);
  const onError = (data) => {};
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      ...data,
      grid_points: grid_points,
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
      setError={setError}
      control={control}
      showPerimeter={false}
      errors={errors}
      system={system}
    >
      <div>
        <p style={{ marginBottom: '25px' }}>
          {t('FARM_MAP.BARN.WASH_PACK')}
          <Label style={{ paddingLeft: '10px' }} sm>
            ({t('common:OPTIONAL')})
          </Label>
        </p>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('common:YES')}
            inputRef={register({ required: false })}
            name={barnEnum.wash_and_pack}
            value={true}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('common:NO')}
            inputRef={register({ required: false })}
            name={barnEnum.wash_and_pack}
            value={false}
          />
        </div>
      </div>
      <div>
        <p style={{ marginBottom: '25px' }}>
          {t('FARM_MAP.BARN.COLD_STORAGE')}
          <Label style={{ paddingLeft: '10px' }} sm>
            ({t('common:OPTIONAL')})
          </Label>
        </p>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
            label={t('common:YES')}
            inputRef={register({ required: false })}
            name={barnEnum.cold_storage}
            value={true}
          />
        </div>
        <div>
          <Radio
            style={{ marginBottom: '25px' }}
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
